const createHttpError = require("http-errors");
const QRCode = require("qrcode");
const config = require("../config/config");
const wa = require("../services/whatsapp");
const whLog = require("../services/webhookLog");

const requireAdmin = (req) => req.user?.role?.toLowerCase() === "admin";

const getStatus = async (req, res, next) => {
    try {
        if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
        const status = wa.getStatus();
        return res.json({
            success: true,
            configured: status.status !== "not_configured",
            reachable: true,
            inProcess: true,
            defaultPrefix: config.whatsappDefaultPrefix,
            currentProvider: process.env.WA_PROVIDER || config.whatsappProvider || "baileys",
            meta: {
                phoneNumberId: process.env.META_PHONE_NUMBER_ID || config.metaPhoneNumberId || "",
                hasAccessToken: !!(process.env.META_ACCESS_TOKEN || config.metaAccessToken),
                verifyToken: process.env.META_VERIFY_TOKEN || config.metaVerifyToken || "",
            },
            ...status,
        });
    } catch (err) {
        next(err);
    }
};

const getQr = async (req, res, next) => {
    try {
        if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
        const status = wa.getStatus();
        return res.json({
            success: true,
            status: status.status,
            qrDataUrl: status.qrDataUrl || null,
            connectedAt: status.connectedAt,
        });
    } catch (err) {
        next(err);
    }
};

const sendTest = async (req, res, next) => {
    try {
        if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
        const { to, message } = req.body || {};
        if (!to) return next(createHttpError(400, "Numero requerido"));
        const normalized = wa.normalizePhone(to);
        const finalMessage = message?.trim() || "Mensaje de prueba desde el dashboard de Cafeteria 5 ✓";
        const result = await wa.sendWhatsApp(normalized, finalMessage, { humanize: false });
        if (!result.ok) {
            return res.status(502).json({ success: false, normalizedPhone: normalized, error: result.error || "Envio fallido" });
        }
        return res.json({ success: true, normalizedPhone: normalized, id: result.id });
    } catch (err) {
        next(err);
    }
};

// Test rápido de envío de imagen: genera un QR a partir de `payload` (o un
// texto demo) y lo manda al número indicado con la `caption` provista.
// Body: { to, payload?, caption? }
const sendTestImage = async (req, res, next) => {
    try {
        if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
        const { to, payload, caption } = req.body || {};
        if (!to) return next(createHttpError(400, "Numero requerido"));
        const normalized = wa.normalizePhone(to);
        const qrText = (payload && String(payload).trim()) || `Cafeteria 5 demo QR — ${new Date().toISOString()}`;
        const buffer = await QRCode.toBuffer(qrText, {
            errorCorrectionLevel: "M",
            type: "png",
            margin: 2,
            width: 512,
        });
        const finalCaption = caption?.trim() ||
            "QR de prueba desde el dashboard de Cafetería 5 ✓\nEscanéalo para verificar la entrega.";
        const result = await wa.sendWhatsAppImage(normalized, buffer, { caption: finalCaption });
        if (!result.ok) {
            return res.status(502).json({ success: false, normalizedPhone: normalized, error: result.error || "Envio fallido" });
        }
        return res.json({ success: true, normalizedPhone: normalized, id: result.id });
    } catch (err) {
        next(err);
    }
};

const logout = async (req, res, next) => {
    try {
        if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
        const provider = wa.getProvider();
        if (provider?.logout) await provider.logout();
        return res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

const resetCredentials = async (req, res, next) => {
    try {
        if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
        const result = await wa.resetCredentials();
        if (!result.ok) return res.status(400).json({ success: false, error: result.error });
        return res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Cambia el provider en caliente (baileys ↔ meta) sin reiniciar el servidor.
const switchProvider = async (req, res, next) => {
    try {
        if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
        const { provider: newProvider } = req.body || {};
        if (!["baileys", "meta"].includes(newProvider)) {
            return next(createHttpError(400, 'Provider debe ser "baileys" o "meta"'));
        }
        const result = await wa.switchProvider(newProvider);
        if (!result.ok) return res.status(500).json({ success: false, error: result.error });
        return res.json({ success: true, provider: newProvider, ...result });
    } catch (err) {
        next(err);
    }
};

// GET /api/whatsapp/webhook/meta  — Meta llama a esto para verificar el webhook.
// No requiere token JWT — es una llamada de Meta, no del frontend.
const metaWebhookVerify = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    const expected = process.env.META_VERIFY_TOKEN || config.metaVerifyToken;

    if (mode === "subscribe" && expected && token === expected) {
        console.log("[meta-webhook] verificación OK");
        return res.status(200).send(challenge);
    }
    console.warn("[meta-webhook] verificación fallida — token incorrecto o VERIFY_TOKEN vacío");
    return res.status(403).json({ error: "Forbidden" });
};

// POST /api/whatsapp/webhook/meta — Meta envía los mensajes entrantes aquí.
const metaWebhookReceive = async (req, res, next) => {
    res.status(200).json({ status: "ok" });
    const body = req.body || {};
    whLog.push("webhook_received", {
        object: body.object,
        hasMessages: !!(body.entry?.[0]?.changes?.[0]?.value?.messages?.length),
    });
    try {
        const provider = wa.getProvider();
        if (typeof provider?.ingestWebhookPayload === "function") {
            await provider.ingestWebhookPayload(body);
        } else {
            const msg = "provider actual no soporta ingestWebhookPayload";
            console.warn("[meta-webhook]", msg);
            whLog.push("error", { stage: "ingest", error: msg });
        }
    } catch (err) {
        console.error("[meta-webhook] error procesando payload:", err.message);
        whLog.push("error", { stage: "ingest", error: err.message });
    }
};

// GET /api/whatsapp/diag?secret=BOT_WEBHOOK_SECRET — diagnóstico sin JWT
const getDiag = async (req, res) => {
    if (req.query.secret !== (config.botWebhookSecret || "")) {
        return res.status(403).json({ error: "secret incorrecto" });
    }
    const BotConfig = require("../models/botConfigModel");
    const { checkGroqConnection } = require("../services/groqService");
    const [cfg, groq] = await Promise.all([BotConfig.getBotConfig(), checkGroqConnection()]);
    const waStatus = wa.getStatus();
    return res.json({
        bot: { enabled: cfg.enabled, updatedBy: cfg.updatedBy, updatedAt: cfg.updatedAt },
        whatsapp: { provider: process.env.WA_PROVIDER || "baileys", status: waStatus.status, phoneNumberId: process.env.META_PHONE_NUMBER_ID || "" },
        groq: { ok: groq.ok, model: config.groqModel, error: groq.error || null },
        recentEvents: whLog.getAll().slice(0, 20),
    });
};

module.exports = {
    getStatus,
    getQr,
    sendTest,
    sendTestImage,
    logout,
    resetCredentials,
    switchProvider,
    metaWebhookVerify,
    metaWebhookReceive,
    getDiag,
};
