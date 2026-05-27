const createHttpError = require("http-errors");
const config = require("../config/config");
const BotConfig = require("../models/botConfigModel");
const { checkGroqConnection, generateReply } = require("../services/groqService");
const { sendWhatsApp, normalizePhone } = require("../services/whatsappService");
const { buildContextForPhone } = require("../services/posContextService");
const { BOT_TOOLS, executeBotTool } = require("../services/botTools");

const requireAdmin = (req) => req.user?.role?.toLowerCase() === "admin";

const HISTORY_LIMIT = 6;
const conversations = new Map();

// Helper para detectar si el usuario pregunta por el menú o pedidos
const needsFullContext = (text) => {
  const normalized = String(text || "").toLowerCase();
  // Solo mandamos el menú si es explícito o parece que el usuario está "vitrineando"
  return /menu|carta|que hay|precio|costo|lista|opciones/i.test(normalized);
};

const pushTurn = (key, role, text) => {
  if (!key) return;
  const arr = conversations.get(key) || [];
  arr.push({ role, text });
  while (arr.length > HISTORY_LIMIT) arr.shift();
  conversations.set(key, arr);
};

const wsBroadcast = (event) => {
  try { require("../services/wsServer").broadcast(event); } catch (_) {}
};

const whLog = require("../services/webhookLog");

const getStatus = async (req, res, next) => {
  try {
    if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
    const status = await checkGroqConnection();
    const cfg = await BotConfig.getBotConfig();
    return res.json({
      success: true,
      hasApiKey: !!config.groqApiKey,
      configuredModel: config.groqModel,
      enabled: cfg.enabled,
      ...status,
    });
  } catch (err) {
    next(err);
  }
};

const getPrompt = async (req, res, next) => {
  try {
    if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
    const doc = await BotConfig.getBotConfig();
    return res.json({
      success: true,
      prompt: doc.prompt,
      enabled: doc.enabled,
      updatedAt: doc.updatedAt,
      updatedBy: doc.updatedBy,
    });
  } catch (err) {
    next(err);
  }
};

const savePrompt = async (req, res, next) => {
  try {
    if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
    const { prompt, enabled } = req.body || {};
    const doc = await BotConfig.getBotConfig();
    if (typeof prompt === "string") {
      if (!prompt.trim()) return next(createHttpError(400, "El prompt no puede estar vacío"));
      if (prompt.length > 20000)
        return next(createHttpError(400, "El prompt excede 20.000 caracteres"));
      doc.prompt = prompt;
    }
    if (typeof enabled === "boolean") doc.enabled = enabled;
    doc.updatedBy = req.user?.email || req.user?.name || null;
    await doc.save();
    return res.json({
      success: true,
      prompt: doc.prompt,
      enabled: doc.enabled,
      updatedAt: doc.updatedAt,
      updatedBy: doc.updatedBy,
    });
  } catch (err) {
    next(err);
  }
};

const resetPrompt = async (req, res, next) => {
  try {
    if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
    const { DEFAULT_PROMPT } = require("../models/botConfigModel");
    const doc = await BotConfig.getBotConfig();
    doc.prompt = DEFAULT_PROMPT;
    doc.updatedBy = req.user?.email || req.user?.name || null;
    await doc.save();
    return res.json({ success: true, prompt: doc.prompt, updatedAt: doc.updatedAt });
  } catch (err) {
    next(err);
  }
};

const chatTest = async (req, res, next) => {
  try {
    if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
    const { message, history = [], sessionId } = req.body || {};
    if (!message?.trim()) return next(createHttpError(400, "Mensaje requerido"));

    const cfg = await BotConfig.getBotConfig();
    const t0 = Date.now();
    const result = await generateReply(message, { systemPrompt: cfg.prompt, history });
    const elapsedMs = Date.now() - t0;

    if (!result.ok) {
      return res.status(502).json({ success: false, error: result.error, elapsedMs });
    }

    if (sessionId) {
      pushTurn(`test:${sessionId}`, "user", message);
      pushTurn(`test:${sessionId}`, "assistant", result.text);
    }

    return res.json({
      success: true,
      reply: result.text,
      elapsedMs,
      model: config.groqModel,
      usage: result.usage,
    });
  } catch (err) {
    next(err);
  }
};

// Procesa un mensaje entrante de WhatsApp (sin HTTP).
// Lo invoca tanto Baileys (in-process) como el webhook Meta Cloud.
const processIncomingMessage = async ({ from, message, jid, isLid, key, pushName }) => {
  if (!from || !message) return { ok: false, skipped: true, reason: "from/message vacios" };

  const ts = new Date().toISOString();
  console.log(`[wa-bot] entrante de ${from}${isLid ? " (LID)" : ""}: ${String(message).slice(0, 120)}`);

  whLog.push("incoming", { from, name: pushName || null, message: String(message).slice(0, 500) });
  wsBroadcast({ type: "wa:incoming", from, name: pushName || null, message: String(message).slice(0, 1000), timestamp: ts });

  const cfg = await BotConfig.getBotConfig();
  if (!cfg.enabled) {
    console.warn("[wa-bot] bot DESHABILITADO");
    whLog.push("skipped", { from, reason: "bot deshabilitado" });
    return { ok: true, skipped: true, reason: "bot deshabilitado" };
  }
  if (!config.groqApiKey) {
    console.warn("[wa-bot] sin GROQ_API_KEY");
    whLog.push("skipped", { from, reason: "sin GROQ_API_KEY" });
    return { ok: true, skipped: true, reason: "sin API key" };
  }

  const phone = normalizePhone(from);
  const historyKey = `wa:${phone}`;
  const history = conversations.get(historyKey) || [];

  let contextBlock = "";
  try {
    const ctx = await buildContextForPhone(phone);
    // OPTIMIZACIÓN DE TOKENS:
    // Si es el primer mensaje, o el usuario pregunta algo específico, mandamos todo.
    // De lo contrario, mandamos una versión ligera para ahorrar tokens en cada turno.
    if (history.length === 0 || needsFullContext(message)) {
      contextBlock = ctx.text;
    } else {
      contextBlock = `Cliente: ${ctx.customer?.name || "Nuevo"}. Pedidos recientes: ${ctx.ordersCount}. (Menú omitido para ahorrar tokens; asume que el cliente ya lo conoce o pregúntale si quiere verlo).`;
    }
    if (ctx.customer) console.log(`[wa-bot] cliente: ${ctx.customer.name}`);
  } catch (ctxErr) {
    console.warn("[wa-bot] no se pudo construir contexto:", ctxErr.message);
  }

  const toolCtx = { phone, customerName: pushName || null };
  const result = await generateReply(message, {
    systemPrompt: cfg.prompt,
    contextBlock,
    history,
    tools: BOT_TOOLS,
    executeTool: (call) => executeBotTool(call, toolCtx),
    maxToolRounds: 3,
  });
  if (!result.ok) {
    console.warn("[wa-bot] generación fallida:", result.error);
    whLog.push("error", { from, stage: "groq", error: result.error });
    return { ok: false, error: result.error };
  }

  if (Array.isArray(result.toolEvents) && result.toolEvents.length) {
    for (const ev of result.toolEvents) {
      console.log(`[wa-bot] tool ${ev.name} → ok=${ev.result?.ok}`);
      whLog.push("tool", { from, name: ev.name, ok: !!ev.result?.ok, summary: ev.result?.message || ev.result?.error || "" });
    }
  }

  // Si el modelo dejó la respuesta vacía (raro, pasa cuando solo emitió tool_calls
  // en la última ronda), damos un cierre razonable basado en lo que hicieron las tools.
  let replyText = result.text;
  if (!replyText?.trim()) {
    const qrEv = result.toolEvents?.find((e) => e.name === "send_payment_qr");
    const orderEv = result.toolEvents?.find((e) => e.name === "create_order");

    if (qrEv) {
      if (qrEv.result?.ok) {
        replyText = `Listo, registré tu pedido ${orderEv?.result?.shortId || ""} por Bs ${qrEv.result.amount}. Acabo de enviarte el QR de pago. Debes pagar el monto solicitado; el QR tiene una duración de 10 minutos. Una vez pagado, comenzaremos a preparar tu pedido. ☕`;
      } else {
        replyText = `Tuve un problema al generar tu QR de pago: ${qrEv.result?.error || "Error desconocido"}. ¿Quieres que intente generarlo de nuevo?`;
      }
    } else if (orderEv) {
      if (orderEv.result?.ok) {
        replyText = `Tu pedido ${orderEv.result.shortId} quedó registrado por Bs ${orderEv.result.total}. En un momento te paso el QR de pago.`;
      } else {
        replyText = `No pude registrar tu pedido: ${orderEv.result?.error || "Error desconocido"}. ¿Podemos intentarlo de nuevo?`;
      }
    } else {
      replyText = "Entendido. ¿En qué más te puedo ayudar?";
    }
  }

  pushTurn(historyKey, "user", message);
  pushTurn(historyKey, "assistant", replyText);

  const sendOpts = jid ? { jid, originalMsgKey: key } : { originalMsgKey: key };
  const sendResult = await sendWhatsApp(phone, replyText, sendOpts);

  if (!sendResult.ok) {
    console.warn(`[wa-bot] envío falló para ${jid || phone}:`, sendResult.error);
    whLog.push("error", { from, stage: "send", error: sendResult.error || "envío fallido" });
  } else {
    console.log(`[wa-bot] respuesta enviada a ${jid || phone}`);
    whLog.push("reply", { to: from, name: pushName || null, reply: replyText.slice(0, 500) });
    wsBroadcast({ type: "wa:reply", to: from, name: pushName || null, reply: replyText.slice(0, 1000), timestamp: new Date().toISOString() });
  }

  return { ok: true, reply: replyText, delivered: sendResult.ok, toolEvents: result.toolEvents };
};

// Webhook HTTP legacy — compatible con microservicio externo si aún estuviera activo
const whatsappWebhook = async (req, res, next) => {
  try {
    const secret = req.header("x-webhook-secret");
    if (!config.botWebhookSecret || secret !== config.botWebhookSecret) {
      return res.status(401).json({ success: false, error: "secret inválido" });
    }
    const { from, message, jid, isLid } = req.body || {};
    if (!from || !message) return res.status(400).json({ success: false, error: "from y message requeridos" });
    const result = await processIncomingMessage({ from, message, jid, isLid });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("[groq-webhook] error:", err);
    next(err);
  }
};

const clearHistory = async (req, res, next) => {
  try {
    if (!requireAdmin(req)) return next(createHttpError(403, "Forbidden"));
    const { sessionId, phone } = req.body || {};
    if (sessionId) conversations.delete(`test:${sessionId}`);
    if (phone) conversations.delete(`wa:${normalizePhone(phone)}`);
    if (!sessionId && !phone) conversations.clear();
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStatus,
  getPrompt,
  savePrompt,
  resetPrompt,
  chatTest,
  whatsappWebhook,
  processIncomingMessage,
  clearHistory,
};
