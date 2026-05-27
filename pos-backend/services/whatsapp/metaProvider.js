// Stub para WhatsApp Cloud API (Meta).
// Cuando quieras migrar:
//   1. Crear app en developers.facebook.com → WhatsApp → Cloud API.
//   2. Obtener WHATSAPP_PHONE_NUMBER_ID y WHATSAPP_ACCESS_TOKEN permanente.
//   3. Configurar webhook que apunte a /api/whatsapp/webhook/meta con el WHATSAPP_VERIFY_TOKEN.
//   4. Setear WA_PROVIDER=meta en el .env.
//
// Mantiene la misma interfaz del provider para que el resto del backend no cambie.

function createMetaProvider({ phoneNumberId, accessToken, logger }) {
    let incomingHandler = null;
    const state = {
        status: phoneNumberId && accessToken ? "connected" : "not_configured",
        connectedAt: phoneNumberId && accessToken ? new Date().toISOString() : null,
        lastError: null,
    };

    const log = logger || console;
    const GRAPH_BASE = "https://graph.facebook.com/v20.0";

    const start = async () => {
        if (!phoneNumberId || !accessToken) {
            state.status = "not_configured";
            return;
        }
        // Cloud API es stateless — no hay socket persistente. "Conectado" = credenciales presentes.
        state.status = "connected";
        state.connectedAt = new Date().toISOString();
    };

    const sendMessage = async ({ to, text }) => {
        if (state.status !== "connected") {
            return { ok: false, error: "Meta provider no configurado", status: state.status };
        }
        try {
            const url = `${GRAPH_BASE}/${phoneNumberId}/messages`;
            const body = {
                messaging_product: "whatsapp",
                to: String(to).replace(/\D/g, ""),
                type: "text",
                text: { body: String(text) },
            };
            const r = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify(body),
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok) {
                log.warn?.("[meta] envío fallido", r.status, data);
                return { ok: false, error: data?.error?.message || `HTTP ${r.status}` };
            }
            return { ok: true, id: data?.messages?.[0]?.id };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    };

    // Sube un Buffer como media y devuelve el media_id que se usa para mandar la imagen.
    const uploadMedia = async (buffer, mimeType = "image/png") => {
        const url = `${GRAPH_BASE}/${phoneNumberId}/media`;
        // Graph API requiere multipart/form-data; usamos FormData (Node 18+ trae globalThis.FormData/Blob).
        const form = new FormData();
        form.append("messaging_product", "whatsapp");
        form.append("type", mimeType);
        form.append("file", new Blob([buffer], { type: mimeType }), "image.png");
        const r = await fetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: form,
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.error?.message || `upload HTTP ${r.status}`);
        return data?.id;
    };

    const sendImage = async ({ to, buffer, caption }) => {
        if (state.status !== "connected") {
            return { ok: false, error: "Meta provider no configurado", status: state.status };
        }
        if (!Buffer.isBuffer(buffer)) {
            return { ok: false, error: "buffer de imagen invalido" };
        }
        try {
            const mediaId = await uploadMedia(buffer, "image/png");
            const url = `${GRAPH_BASE}/${phoneNumberId}/messages`;
            const body = {
                messaging_product: "whatsapp",
                to: String(to).replace(/\D/g, ""),
                type: "image",
                image: { id: mediaId, caption: caption ? String(caption) : undefined },
            };
            const r = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify(body),
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok) {
                log.warn?.("[meta] envío imagen fallido", r.status, data);
                return { ok: false, error: data?.error?.message || `HTTP ${r.status}` };
            }
            return { ok: true, id: data?.messages?.[0]?.id };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    };

    const getStatus = () => ({
        provider: "meta",
        status: state.status,
        connectedAt: state.connectedAt,
        hasQR: false,
        qrDataUrl: null,
        lastError: state.lastError,
    });

    const onIncomingMessage = (handler) => { incomingHandler = handler; };

    // Helper público para que el webhook HTTP (controller) reenvíe eventos al handler.
    const ingestWebhookPayload = async (body) => {
        if (!incomingHandler) return;
        try {
            const entries = body?.entry || [];
            for (const entry of entries) {
                for (const change of entry.changes || []) {
                    const value = change.value || {};
                    for (const msg of value.messages || []) {
                        if (msg.type !== "text") continue;
                        const from = msg.from;
                        const text = msg.text?.body || "";
                        if (!from || !text) continue;
                        await incomingHandler({
                            from,
                            message: text,
                            jid: null,
                            isLid: false,
                            pushName: value.contacts?.[0]?.profile?.name,
                            key: { id: msg.id },
                        });
                    }
                }
            }
        } catch (err) {
            log.warn?.("[meta] error procesando webhook", err.message);
        }
    };

    const logout = async () => {
        state.status = "disconnected";
    };

    return { start, sendMessage, sendImage, getStatus, onIncomingMessage, logout, ingestWebhookPayload };
}

module.exports = { createMetaProvider };
