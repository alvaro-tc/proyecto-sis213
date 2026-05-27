// Punto de entrada único del subsistema WhatsApp.
//
// Selecciona el provider (Baileys = WhatsApp Web, o Meta Cloud API).
// El resto del backend SOLO debería usar este módulo — nunca importar providers directamente.

const path = require("path");
const { renderQrWithLogo } = require("../qrLogoService");
const config = require("../../config/config");
const { createBaileysProvider } = require("./baileysProvider");
const { createMetaProvider } = require("./metaProvider");

let provider = null;
let started = false;
let _incomingHandler = null; // guardado para reusar en switchProvider

const DEFAULT_PREFIX = String(config.whatsappDefaultPrefix || "591").replace(/\D/g, "");

const normalizePhone = (raw) => {
    if (!raw) return null;
    let digits = String(raw).trim().replace(/\D/g, "");
    if (!digits) return null;
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.length >= 11) return digits;
    if (!digits.startsWith(DEFAULT_PREFIX)) digits = DEFAULT_PREFIX + digits;
    return digits;
};

// Lee el provider activo desde process.env (permite override en runtime sin reiniciar).
const buildProvider = (nameOverride) => {
    const which = String(nameOverride || process.env.WA_PROVIDER || config.whatsappProvider || "baileys").toLowerCase();
    if (which === "meta") {
        return createMetaProvider({
            phoneNumberId: process.env.META_PHONE_NUMBER_ID || config.metaPhoneNumberId,
            accessToken: process.env.META_ACCESS_TOKEN || config.metaAccessToken,
        });
    }
    return createBaileysProvider({
        authDir: config.whatsappAuthDir || path.join(__dirname, "..", "..", "auth_info_baileys"),
        humanizerOptions: {
            minDelayMs: Number(config.whatsappMinDelayMs) || 1200,
            maxDelayMs: Number(config.whatsappMaxDelayMs) || 4500,
            globalPerMinute: Number(config.whatsappRatePerMinute) || 25,
            globalPerDay: Number(config.whatsappRatePerDay) || 800,
            perJidPerMinute: Number(config.whatsappPerJidPerMinute) || 5,
            perJidPerDay: Number(config.whatsappPerJidPerDay) || 30,
        },
    });
};

const init = async (incomingHandler) => {
    if (started) return provider;
    _incomingHandler = incomingHandler || null;
    provider = buildProvider();
    if (_incomingHandler) provider.onIncomingMessage(_incomingHandler);
    await provider.start();
    started = true;
    return provider;
};

// Cambia el provider en caliente sin reiniciar el proceso.
const switchProvider = async (newProviderName) => {
    try {
        // Detiene el provider actual limpiamente
        if (provider?.logout) {
            try { await provider.logout(); } catch (_) {}
        }
    } catch (_) {}

    // Actualiza la variable de entorno para que getStatus() y futuros buildProvider() la lean
    process.env.WA_PROVIDER = newProviderName;
    started = false;
    provider = null;

    // Re-inicializa con el nuevo provider
    await init(_incomingHandler);
    return { ok: true, provider: newProviderName, status: provider ? provider.getStatus() : null };
};

const getProvider = () => provider;
const getStatus = () => (provider ? provider.getStatus() : { provider: null, status: "not_initialized" });

const resetCredentials = async () => {
    if (!provider) return { ok: false, error: "provider no iniciado" };
    if (typeof provider.resetCredentials !== "function") {
        return { ok: false, error: "el provider actual no soporta reset" };
    }
    return provider.resetCredentials();
};

const sendWhatsApp = async (to, message, opts = {}) => {
    if (!provider) return { ok: false, error: "provider no iniciado" };
    const { jid, humanize = true, originalMsgKey } = opts;
    const phone = jid ? null : normalizePhone(to);
    if (!jid && !phone) return { ok: false, error: "numero invalido" };
    return provider.sendMessage({
        to: phone,
        jid,
        text: message,
        humanize,
        originalMsgKey,
    });
};

const sendWhatsAppImage = async (to, buffer, opts = {}) => {
    if (!provider) return { ok: false, error: "provider no iniciado" };
    if (typeof provider.sendImage !== "function") {
        return { ok: false, error: "el provider actual no soporta envío de imágenes" };
    }
    const { jid, caption } = opts;
    const phone = jid ? null : normalizePhone(to);
    if (!jid && !phone) return { ok: false, error: "numero invalido" };
    return provider.sendImage({ to: phone, jid, buffer, caption });
};

// Genera el PNG del QR (con el logo de Cafeteria Aromatica en el centro) y lo
// manda por WhatsApp con instrucciones. Devuelve { ok, error?, id? }.
//
// Soporta dos esquemas de validacion segun el provider:
//   - token_concept (MSC) → el cliente NO debe modificar el concepto.
//   - amount_decimals (ZAS) → el cliente debe pagar el monto exacto incluyendo
//     los decimales (porque ahi va codificado el slot del pedido).
const sendYapePaymentQr = async ({
    phone,
    qrPayload,
    amount,
    paymentId,
    code,
    customerName,
    provider,
    providerLabel,
    validationMethod,
}) => {
    if (!phone) return { ok: false, error: "telefono requerido" };
    if (!qrPayload) return { ok: false, error: "qr_payload requerido" };
    try {
        const buffer = await renderQrWithLogo(qrPayload, { size: 600 });
        const greet = customerName ? `Hola ${customerName}` : "Hola";
        const amt = amount != null ? Number(amount).toFixed(2) : null;
        const totalLine = amt ? ` por *Bs ${amt}*` : "";
        const bankLine = providerLabel ? `\nBanco: *${providerLabel}*` : "";
        let methodLine = "";
        if (validationMethod === "token_concept" && code) {
            methodLine = `\nConcepto/referencia: *${code}* (no lo modifiques al pagar)`;
        } else if (validationMethod === "amount_decimals" && amt) {
            methodLine = `\n⚠ Paga *exactamente Bs ${amt}* (los decimales identifican tu pedido).`;
        } else if (code) {
            methodLine = `\nReferencia: *${code}*`;
        }
        const idLine = paymentId ? `\nID: ${String(paymentId).slice(0, 8)}…` : "";
        const caption =
            `${greet}, aquí está tu QR de pago${totalLine}.\n` +
            `Escanéalo desde tu app bancaria. El monto viene precargado — solo confirma el pago.` +
            `${bankLine}${methodLine}${idLine}\n` +
            `Te confirmaremos automáticamente cuando se acredite. ¡Gracias por elegir Cafetería Aromática! ☕`;
        return await sendWhatsAppImage(phone, buffer, { caption });
    } catch (err) {
        return { ok: false, error: err.message };
    }
};

// Mensaje "tu QR esta en camino" con la ETA estimada (segundos).
const sendQrEtaNotice = async ({ phone, etaSeconds, providerLabel, amount, customerName }) => {
    if (!phone) return { ok: false, error: "telefono requerido" };
    const greet = customerName ? `Hola ${customerName}` : "Hola";
    const sec = Math.max(1, Math.round(Number(etaSeconds) || 60));
    const human = sec >= 60 ? `~${Math.ceil(sec / 60)} min` : `~${sec} s`;
    const amt = amount != null ? Number(amount).toFixed(2) : null;
    const totalLine = amt ? ` por *Bs ${amt}*` : "";
    const bank = providerLabel ? ` (${providerLabel})` : "";
    const text =
        `${greet}, estamos generando tu QR de pago${totalLine}${bank}.\n` +
        `Te llegará por aquí en ${human}. ¡No cierres este chat! ☕`;
    return sendWhatsApp(phone, text);
};

// Aviso de failover: el banco prioritario fallo y reintentamos con otro.
const sendQrFailoverNotice = async ({ phone, failedProvider, nextProvider, newEtaSeconds }) => {
    if (!phone) return { ok: false, error: "telefono requerido" };
    const sec = Math.max(1, Math.round(Number(newEtaSeconds) || 60));
    const human = sec >= 60 ? `~${Math.ceil(sec / 60)} min` : `~${sec} s`;
    const text =
        `Tuvimos un problema con el banco ${failedProvider}. ` +
        `Reintentamos con ${nextProvider}; tu QR llegará en ${human}. Gracias por tu paciencia.`;
    return sendWhatsApp(phone, text);
};

// Helpers de notificaciones de negocio
const buildOrderShortId = (order) => {
    const id = order?._id?.toString?.() || "";
    return id ? `#${id.slice(-6).toUpperCase()}` : "";
};

const statusMessages = {
    "In Progress": (o, n) => `Hola ${n}, recibimos tu pedido ${buildOrderShortId(o)} en Cafeteria 5. Te avisaremos cuando este listo. ¡Gracias!`,
    "Preparing":   (o, n) => `Hola ${n}, tu pedido ${buildOrderShortId(o)} ya esta en preparacion. ☕`,
    "Ready":       (o, n) => `Hola ${n}, tu pedido ${buildOrderShortId(o)} esta listo para recoger. ¡Buen provecho!`,
    "Completed":   (o, n) => `Hola ${n}, tu pedido ${buildOrderShortId(o)} ha sido entregado. Gracias por visitarnos en Cafeteria 5.`,
    "Cancelled":   (o, n) => `Hola ${n}, tu pedido ${buildOrderShortId(o)} fue cancelado. Si tienes dudas contactanos.`,
};

const notifyOrderStatus = (order, status) => {
    const phone = order?.customerDetails?.phone;
    if (!phone) return;
    const name = order?.customerDetails?.name || "cliente";
    const builder = statusMessages[status];
    if (!builder) return;
    sendWhatsApp(phone, builder(order, name)).catch(() => {});
};

const notifyOrderPaid = (order) => {
    const phone = order?.customerDetails?.phone;
    if (!phone) return;
    const name = order?.customerDetails?.name || "cliente";
    const shortId = buildOrderShortId(order);
    const total = order?.bills?.totalWithTax;
    const totalLine = total ? ` por Bs ${Number(total).toFixed(2)}` : "";
    const message = `Hola ${name}, confirmamos el pago de tu pedido ${shortId}${totalLine}. Estamos preparandolo y te avisaremos cuando avance. ¡Gracias por elegir Cafeteria 5!`;
    sendWhatsApp(phone, message).catch(() => {});
};

module.exports = {
    init,
    getProvider,
    getStatus,
    resetCredentials,
    switchProvider,
    sendWhatsApp,
    sendWhatsAppImage,
    sendYapePaymentQr,
    sendQrEtaNotice,
    sendQrFailoverNotice,
    normalizePhone,
    notifyOrderStatus,
    notifyOrderPaid,
};
