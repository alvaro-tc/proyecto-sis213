// Capa de humanización compartida por todos los providers (Baileys hoy, Meta mañana).
// Objetivo: evitar patrones de bot que disparan baneos en WhatsApp Web (Baileys).
//
// Capas de defensa (de más estricta a más laxa):
//   1. Daily cap GLOBAL (defecto 800/día). WhatsApp empieza a marcar números que envían >1k/día.
//   2. Daily cap POR CONTACTO (defecto 30/día). Conversación normal raramente supera esto.
//   3. Rate POR CONTACTO (defecto 5/min). Mata loops accidentales bot↔bot.
//   4. Rate GLOBAL (defecto 25/min). Tope general de cordura.
//   5. Cola POR CHAT: nunca dos respuestas paralelas al mismo JID.
//   6. Delay humano: pausa + "escribiendo…" antes de enviar, proporcional al texto.
//   7. Cooldown extra en primer contacto del día con un JID (parecemos más naturales).
//
// El "hook" desacopla la lógica humana del transporte: en Baileys usamos sendPresenceUpdate,
// en Meta Cloud probablemente sea un no-op (no hay "typing" público en la API oficial).

const DEFAULT_OPTS = {
    minDelayMs: 1200,
    maxDelayMs: 4500,
    perCharMs: 55,
    maxTypingMs: 7000,
    globalPerMinute: 25,
    globalPerDay: 800,
    perJidPerMinute: 5,
    perJidPerDay: 30,
    newContactExtraDelayMs: 2500,
};

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC

function createHumanizer(opts = {}) {
    const cfg = { ...DEFAULT_OPTS, ...opts };
    const chatQueues = new Map(); // jid -> Promise (chain)
    const globalRecent = []; // epoch ms de envíos recientes (60s window)
    const perJidRecent = new Map(); // jid -> array epoch ms (60s window)
    const dailyCounts = { day: todayKey(), global: 0, perJid: new Map() };

    const rollDayIfNeeded = () => {
        const today = todayKey();
        if (dailyCounts.day !== today) {
            dailyCounts.day = today;
            dailyCounts.global = 0;
            dailyCounts.perJid = new Map();
        }
    };

    const pruneWindow = (arr) => {
        const cutoff = Date.now() - 60_000;
        while (arr.length && arr[0] < cutoff) arr.shift();
    };

    const stats = () => {
        rollDayIfNeeded();
        pruneWindow(globalRecent);
        return {
            day: dailyCounts.day,
            globalSentToday: dailyCounts.global,
            globalCapDaily: cfg.globalPerDay,
            globalSentLastMinute: globalRecent.length,
            globalCapPerMinute: cfg.globalPerMinute,
            perJidCapDaily: cfg.perJidPerDay,
            perJidCapPerMinute: cfg.perJidPerMinute,
            activeChats: chatQueues.size,
        };
    };

    /**
     * Decide si se puede enviar a `jid`. Si no, devuelve cuántos ms esperar o un error duro.
     * Reglas duras: daily caps → no enviar (return { drop:true }).
     * Reglas blandas: rate caps → esperar (return { waitMs }).
     */
    const computeGate = (jid) => {
        rollDayIfNeeded();
        if (dailyCounts.global >= cfg.globalPerDay) {
            return { drop: true, reason: `daily-cap global alcanzado (${cfg.globalPerDay})` };
        }
        const perDayJid = dailyCounts.perJid.get(jid) || 0;
        if (perDayJid >= cfg.perJidPerDay) {
            return { drop: true, reason: `daily-cap por contacto alcanzado (${cfg.perJidPerDay})` };
        }
        pruneWindow(globalRecent);
        if (globalRecent.length >= cfg.globalPerMinute) {
            const waitMs = 60_000 - (Date.now() - globalRecent[0]) + randInt(100, 500);
            return { waitMs, reason: "rate global" };
        }
        const arr = perJidRecent.get(jid) || [];
        pruneWindow(arr);
        perJidRecent.set(jid, arr);
        if (arr.length >= cfg.perJidPerMinute) {
            const waitMs = 60_000 - (Date.now() - arr[0]) + randInt(100, 500);
            return { waitMs, reason: "rate por contacto" };
        }
        return { ok: true };
    };

    const registerSend = (jid) => {
        const now = Date.now();
        globalRecent.push(now);
        const arr = perJidRecent.get(jid) || [];
        arr.push(now);
        perJidRecent.set(jid, arr);
        dailyCounts.global += 1;
        dailyCounts.perJid.set(jid, (dailyCounts.perJid.get(jid) || 0) + 1);
    };

    const computeTypingMs = (text, isNewContact) => {
        const base = randInt(cfg.minDelayMs, cfg.maxDelayMs);
        const perChar = Math.min(String(text || "").length * cfg.perCharMs, cfg.maxTypingMs);
        const extra = isNewContact ? randInt(0, cfg.newContactExtraDelayMs) : 0;
        return Math.min(base + perChar + extra, cfg.maxTypingMs + cfg.newContactExtraDelayMs);
    };

    const enqueue = (jid, task) => {
        const prev = chatQueues.get(jid) || Promise.resolve();
        const next = prev.then(task, task);
        chatQueues.set(jid, next.catch(() => {}));
        next.finally(() => {
            if (chatQueues.get(jid) === next) chatQueues.delete(jid);
        });
        return next;
    };

    /**
     * Envía un mensaje "humanizado" usando los hooks que provee el provider.
     * hooks = { read(msgKey)?, typing(jid, on)?, send(jid, text) }
     */
    const sendHumanized = async ({ jid, text, originalMsgKey, hooks }) => {
        return enqueue(jid, async () => {
            // Espera/aborta según reglas de rate y daily caps.
            // Reintenta hasta 3 veces el "wait" para no esperar eternamente si algo se desbalancea.
            for (let attempt = 0; attempt < 3; attempt++) {
                const gate = computeGate(jid);
                if (gate.drop) {
                    return { ok: false, error: gate.reason, dropped: true };
                }
                if (gate.ok) break;
                await sleep(gate.waitMs);
            }

            const isNewContact = !(dailyCounts.perJid.get(jid) > 0);
            try {
                if (hooks.read && originalMsgKey) {
                    await hooks.read(originalMsgKey).catch(() => {});
                }
                const typingMs = computeTypingMs(text, isNewContact);
                const preWait = randInt(400, 1200);
                await sleep(preWait);
                if (hooks.typing) await hooks.typing(jid, true).catch(() => {});
                await sleep(Math.max(0, typingMs - preWait));
                if (hooks.typing) await hooks.typing(jid, false).catch(() => {});

                const result = await hooks.send(jid, text);
                if (result?.ok !== false) registerSend(jid);
                return result;
            } catch (err) {
                if (hooks.typing) hooks.typing(jid, false).catch(() => {});
                throw err;
            }
        });
    };

    return { sendHumanized, stats, _internals: { chatQueues, globalRecent, perJidRecent, dailyCounts, cfg } };
}

module.exports = { createHumanizer };
