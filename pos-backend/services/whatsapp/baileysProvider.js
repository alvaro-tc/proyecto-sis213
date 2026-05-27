// Baileys provider: corre el socket de WhatsApp Web dentro del proceso del backend.
//
// Expone la misma interfaz que cualquier otro provider (metaProvider, etc.):
//   start(), getStatus(), sendMessage(), onIncomingMessage(handler), logout()
//
// Notas de anti-baneo:
//   - No usamos printQRInTerminal y filtramos ruido de libsignal para no parecer "agresivo".
//   - Toda salida pasa por el humanizer (delays + typing + read receipts + rate-limit).
//   - Backoff exponencial al reconectar — los reintentos rápidos son señal de bot.

const path = require("path");
const fs = require("fs");
const pino = require("pino");
const QRCode = require("qrcode");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

const { createHumanizer } = require("./humanizer");

const LIBSIGNAL_NOISE = [
    /Bad MAC/i, /Failed to decrypt message/i, /Closing open session/i,
    /Closing session:/i, /No session record/i, /Invalid PreKey ID/i,
    /SessionEntry\s*\{/, /Session error/i,
];
let consolePatched = false;
const patchConsole = () => {
    if (consolePatched) return;
    consolePatched = true;
    const isNoise = (args) => {
        try {
            for (const a of args) {
                const s = typeof a === "string" ? a : (a instanceof Error ? a.message : "");
                if (LIBSIGNAL_NOISE.some((rx) => rx.test(s))) return true;
            }
        } catch {}
        return false;
    };
    const origLog = console.log.bind(console);
    const origError = console.error.bind(console);
    const origWarn = console.warn.bind(console);
    console.log = (...a) => { if (!isNoise(a)) origLog(...a); };
    console.error = (...a) => { if (!isNoise(a)) origError(...a); };
    console.warn = (...a) => { if (!isNoise(a)) origWarn(...a); };
};

function createBaileysProvider({ authDir, logger, humanizerOptions }) {
    patchConsole();
    const log = logger || pino({ level: process.env.LOG_LEVEL || "info" });

    if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

    const state = {
        sock: null,
        status: "disconnected", // disconnected | qr | connecting | connected
        qr: null,
        qrDataUrl: null,
        lastError: null,
        connectedAt: null,
        reconnectAttempts: 0,
        stopped: false, // bandera para frenar reconexión durante reset manual
    };

    let incomingHandler = null;
    const humanizer = createHumanizer(humanizerOptions);

    const clearAuthDir = () => {
        try {
            if (!fs.existsSync(authDir)) return;
            for (const f of fs.readdirSync(authDir)) {
                try { fs.rmSync(path.join(authDir, f), { recursive: true, force: true }); }
                catch (e) { log.warn({ err: e.message, f }, "[baileys] no se pudo borrar"); }
            }
        } catch (e) {
            log.warn({ err: e.message }, "[baileys] error limpiando authDir");
        }
    };

    const NOISY = [/No session record/i, /failed to decrypt message/i, /Bad MAC/i, /Invalid PreKey ID/i, /init queries/i, /Timed Out/i];
    const isNoisy = (args) => {
        try { return NOISY.some((rx) => rx.test(JSON.stringify(args))); } catch { return false; }
    };
    const wrapLogger = (l) => {
        const child = (b) => wrapLogger(l.child(b));
        return {
            level: l.level, child,
            trace: (...a) => l.trace(...a),
            debug: (...a) => l.debug(...a),
            info: (...a) => l.info(...a),
            warn: (...a) => (isNoisy(a) ? l.debug(...a) : l.warn(...a)),
            error: (...a) => (isNoisy(a) ? l.debug(...a) : l.error(...a)),
            fatal: (...a) => (isNoisy(a) ? l.debug(...a) : l.fatal(...a)),
        };
    };

    const handleIncoming = async ({ messages, type }) => {
        if (type !== "notify" || !incomingHandler) return;
        for (const msg of messages) {
            try {
                if (!msg?.message || msg.key?.fromMe) continue;
                const jid = msg.key?.remoteJid || "";
                if (jid.endsWith("@g.us") || jid === "status@broadcast" || jid === "broadcast") continue;
                // Ignorar tipos protocolo / efímeros / reacciones — solo respondemos a mensajes de texto reales.
                if (msg.message?.protocolMessage || msg.message?.reactionMessage || msg.message?.pollUpdateMessage) continue;

                // Skip mensajes "viejos" (>120s): si reconectamos y nos llega un backlog, no spameamos respuestas
                // tardías — un humano no contesta instantáneamente a algo de hace horas.
                const tsRaw = msg.messageTimestamp;
                const ts = typeof tsRaw === "number" ? tsRaw : (tsRaw?.toNumber?.() ?? Number(tsRaw) ?? 0);
                if (ts && Date.now() / 1000 - ts > 120) {
                    log.info({ jid, ageSec: Math.round(Date.now() / 1000 - ts) }, "[baileys] mensaje antiguo, ignorado");
                    continue;
                }

                const text =
                    msg.message?.conversation ||
                    msg.message?.extendedTextMessage?.text ||
                    msg.message?.imageMessage?.caption ||
                    msg.message?.videoMessage?.caption ||
                    "";
                if (!text?.trim()) continue;

                const senderPn = msg.key?.senderPn || msg.key?.participantPn || null;
                const isLid = jid.endsWith("@lid");
                const phone = senderPn ? String(senderPn).split("@")[0] : (isLid ? null : jid.split("@")[0]);
                const from = phone || jid.split("@")[0];

                log.info({ from, jid, isLid, text }, "[baileys] mensaje entrante");

                Promise.resolve(incomingHandler({
                    from, message: text, jid, isLid, pushName: msg.pushName, key: msg.key,
                })).catch((e) => log.warn({ err: e.message }, "[baileys] handler entrante falló"));
            } catch (err) {
                log.warn({ err: err.message }, "[baileys] error procesando entrante");
            }
        }
    };

    const start = async () => {
        const { state: authState, saveCreds } = await useMultiFileAuthState(authDir);
        const { version } = await fetchLatestBaileysVersion();
        log.info({ version }, "[baileys] iniciando socket");
        state.status = "connecting";

        const sock = makeWASocket({
            version,
            auth: authState,
            printQRInTerminal: false,
            logger: wrapLogger(pino({ level: "warn" })),
            // Browser tipo "WhatsApp Desktop" — patrón menos sospechoso que un browser custom.
            browser: ["Mac OS", "Safari", "10.15.7"],
            // ANTI-BANEO crítico:
            //   markOnlineOnConnect:false → no aparecer "en línea" 24/7 (huella #1 de bot).
            //   syncFullHistory:false → no descargar histórico (tráfico inusual = flag).
            //   emitOwnEvents:false → menos ruido y menos surface para errores raros.
            //   generateHighQualityLinkPreview:false → no descargar previews que disparan peticiones extra.
            markOnlineOnConnect: false,
            syncFullHistory: false,
            emitOwnEvents: false,
            generateHighQualityLinkPreview: false,
            // Stub requerido por Baileys para reintentar mensajes que perdimos del store.
            // Devolvemos undefined: Baileys hace fallback graceful.
            getMessage: async () => undefined,
        });
        state.sock = sock;

        sock.ev.on("creds.update", saveCreds);
        sock.ev.on("messages.upsert", handleIncoming);

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                state.qr = qr;
                state.qrDataUrl = await QRCode.toDataURL(qr);
                state.status = "qr";
                log.info("[baileys] QR generado");
            }
            if (connection === "open") {
                state.status = "connected";
                state.qr = null;
                state.qrDataUrl = null;
                state.connectedAt = new Date().toISOString();
                state.reconnectAttempts = 0;
                state.lastError = null;
                // IMPORTANTE: NO enviar 'available' aquí. Quedar "offline" reduce drásticamente
                // el riesgo de baneo. Solo mostraremos presencia puntual ('composing') al responder
                // un mensaje concreto, lo cual es el patrón humano normal.
                log.info("[baileys] WhatsApp conectado");
            }
            if (connection === "close") {
                const code = lastDisconnect?.error?.output?.statusCode;
                const loggedOut = code === DisconnectReason.loggedOut;
                state.status = "disconnected";
                state.lastError = lastDisconnect?.error?.message || null;
                log.warn({ code, loggedOut }, "[baileys] conexión cerrada");

                if (state.stopped) {
                    log.info("[baileys] reconexión cancelada (provider detenido)");
                    return;
                }
                if (loggedOut) {
                    clearAuthDir();
                    log.warn("[baileys] sesión cerrada, credenciales limpiadas");
                    state.reconnectAttempts = 0;
                    setTimeout(() => { if (!state.stopped) start().catch((e) => log.error(e)); }, 2000);
                } else {
                    state.reconnectAttempts += 1;
                    const base = Math.min(3000 * 2 ** (state.reconnectAttempts - 1), 60_000);
                    const jitter = Math.floor(Math.random() * 1500);
                    setTimeout(() => { if (!state.stopped) start().catch((e) => log.error(e)); }, base + jitter);
                }
            }
        });

        return sock;
    };

    const hooks = {
        read: async (key) => {
            if (state.sock && key) await state.sock.readMessages([key]);
        },
        typing: async (jid, on) => {
            if (!state.sock) return;
            await state.sock.sendPresenceUpdate(on ? "composing" : "paused", jid);
        },
        send: async (jid, text) => {
            if (!state.sock) throw new Error("socket no listo");
            const result = await state.sock.sendMessage(jid, { text: String(text) });
            return { ok: true, id: result?.key?.id, to: jid };
        },
        sendImage: async (jid, buffer, caption) => {
            if (!state.sock) throw new Error("socket no listo");
            const result = await state.sock.sendMessage(jid, {
                image: buffer,
                caption: caption ? String(caption) : undefined,
            });
            return { ok: true, id: result?.key?.id, to: jid };
        },
    };

    const sendMessage = async ({ to, jid, text, humanize = true, originalMsgKey }) => {
        if (state.status !== "connected" || !state.sock) {
            return { ok: false, error: "WhatsApp no conectado", status: state.status };
        }
        const targetJid = jid && /@(s\.whatsapp\.net|lid)$/i.test(jid)
            ? jid
            : `${String(to).replace(/\D/g, "")}@s.whatsapp.net`;
        if (!humanize) return hooks.send(targetJid, text);
        return humanizer.sendHumanized({ jid: targetJid, text, originalMsgKey, hooks });
    };

    const sendImage = async ({ to, jid, buffer, caption }) => {
        if (state.status !== "connected" || !state.sock) {
            return { ok: false, error: "WhatsApp no conectado", status: state.status };
        }
        if (!Buffer.isBuffer(buffer)) {
            return { ok: false, error: "buffer de imagen invalido" };
        }
        const targetJid = jid && /@(s\.whatsapp\.net|lid)$/i.test(jid)
            ? jid
            : `${String(to).replace(/\D/g, "")}@s.whatsapp.net`;
        try {
            return await hooks.sendImage(targetJid, buffer, caption);
        } catch (err) {
            return { ok: false, error: err.message };
        }
    };

    const getStatus = () => ({
        provider: "baileys",
        status: state.status,
        connectedAt: state.connectedAt,
        hasQR: !!state.qr,
        qrDataUrl: state.qrDataUrl,
        lastError: state.lastError,
        reconnectAttempts: state.reconnectAttempts,
        antiBan: humanizer.stats(),
    });

    const onIncomingMessage = (handler) => { incomingHandler = handler; };

    const logout = async () => {
        if (state.sock) await state.sock.logout().catch(() => {});
    };

    /**
     * Reset duro: corta el socket, frena la reconexión automática, borra el authDir,
     * y vuelve a iniciar. Útil cuando las credenciales quedaron corruptas o quieres
     * vincular un número distinto desde el dashboard.
     */
    const resetCredentials = async () => {
        log.warn("[baileys] reset manual solicitado");
        state.stopped = true;
        // logout best-effort (puede fallar si las creds están corruptas — no bloquear)
        if (state.sock) {
            try { await state.sock.logout(); } catch {}
            try { state.sock.ws?.close?.(); state.sock.end?.(undefined); } catch {}
        }
        state.sock = null;
        state.status = "disconnected";
        state.qr = null;
        state.qrDataUrl = null;
        state.lastError = null;
        state.connectedAt = null;
        state.reconnectAttempts = 0;
        clearAuthDir();
        // pequeña pausa para que el sistema cierre handles del FS
        await new Promise((r) => setTimeout(r, 800));
        state.stopped = false;
        await start();
        return { ok: true };
    };

    return { start, sendMessage, sendImage, getStatus, onIncomingMessage, logout, resetCredentials };
}

module.exports = { createBaileysProvider };
