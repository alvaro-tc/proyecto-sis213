require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const config = Object.freeze({
    port: process.env.PORT || 3000,
    databaseURI: process.env.MONGODB_URI || "mongodb://localhost:27017/pos-db",
    nodeEnv : process.env.NODE_ENV || "development",
    accessTokenSecret: process.env.JWT_SECRET,
    // Orquestador QR unificado (api_generador_qr, Django, puerto 8500).
    // Reemplaza al microservicio MSC standalone. Las variables QR_* son las
    // preferidas; MSC_*/YAPE_* se mantienen solo como fallback de compat.
    qrApiUrl: process.env.QR_API_URL || process.env.MSC_API_URL || process.env.YAPE_API_URL || "http://localhost:8500",
    qrApiKey: process.env.QR_API_KEY || process.env.MSC_API_KEY || process.env.YAPE_API_KEY || "",
    // URL publica (visible para el orquestador) donde recibimos webhooks.
    // Ej: https://mi-pos.local/api/payment/qr/webhook
    // Si esta vacio, el backend no pasa callback_url al orquestador y los
    // pagos se confirman por polling del watcher.
    qrPublicWebhookUrl: process.env.QR_PUBLIC_WEBHOOK_URL || "",
    qrWebhookSecret: process.env.QR_WEBHOOK_SECRET || "",
    // Alias legacy — se siguen exportando para no romper imports antiguos.
    mscApiUrl: process.env.QR_API_URL || process.env.MSC_API_URL || process.env.YAPE_API_URL || "http://localhost:8500",
    mscApiKey: process.env.QR_API_KEY || process.env.MSC_API_KEY || process.env.YAPE_API_KEY || "",
    // WhatsApp — provider in-process. Default = baileys (WhatsApp Web).
    // Para migrar a Cloud API oficial: WA_PROVIDER=meta + META_PHONE_NUMBER_ID + META_ACCESS_TOKEN.
    whatsappProvider: process.env.WA_PROVIDER || "baileys",
    whatsappAuthDir: process.env.WHATSAPP_AUTH_DIR || "",
    whatsappDefaultPrefix: process.env.WHATSAPP_DEFAULT_PREFIX || "591",
    // Humanización (anti-baneo) — ajustables sin tocar código
    whatsappMinDelayMs: process.env.WHATSAPP_MIN_DELAY_MS,
    whatsappMaxDelayMs: process.env.WHATSAPP_MAX_DELAY_MS,
    whatsappRatePerMinute: process.env.WHATSAPP_RATE_PER_MINUTE,
    whatsappRatePerDay: process.env.WHATSAPP_RATE_PER_DAY,
    whatsappPerJidPerMinute: process.env.WHATSAPP_PER_JID_PER_MINUTE,
    whatsappPerJidPerDay: process.env.WHATSAPP_PER_JID_PER_DAY,
    // Meta Cloud API (vacío hasta que se configure)
    metaPhoneNumberId: process.env.META_PHONE_NUMBER_ID || "",
    metaAccessToken: process.env.META_ACCESS_TOKEN || "",
    metaVerifyToken: process.env.META_VERIFY_TOKEN || "",
    // Legacy — ya no se usan, conservados temporalmente por compat
    whatsappUrl: process.env.WHATSAPP_URL || "",
    whatsappApiKey: process.env.WHATSAPP_API_KEY || "",
    groqApiKey: process.env.GROQ_API_KEY || process.env.GROK_API_KEY || "",
    groqModel: process.env.GROQ_MODEL || process.env.GROK_MODEL || "llama-3.1-8b-instant",
    groqApiBaseUrl: process.env.GROQ_API_BASE_URL || process.env.GROK_API_BASE_URL || "https://api.groq.com/openai/v1",
    botWebhookSecret: process.env.BOT_WEBHOOK_SECRET || "cambia-este-secreto"
});

module.exports = config;
