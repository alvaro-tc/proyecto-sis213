// Cliente del orquestador api_generador_qr (Django, puerto 8500).
//
// Expone funciones tipadas para generar, consultar, cancelar y listar QR.
// Mapea el schema "Payment" del orquestador a un shape compatible con el
// frontend antiguo (que esperaba `payment_id`, `amount`, `qr_payload`, `code`
// y `status` ∈ {pending,paid,expired,...}), preservando ademas los campos
// nuevos: `id`, `provider`, `estimated_seconds`, `amount_to_pay`,
// `requested_amount`, `failover_count`, `attempts`.

const config = require("../config/config");

const baseUrl = () => (config.qrApiUrl || "http://localhost:8500").replace(/\/$/, "");

const orchFetch = async (path, { method = "GET", body, timeoutMs = 30_000 } = {}) => {
    const url = `${baseUrl()}${path}`;
    const headers = { "Content-Type": "application/json" };
    if (config.qrApiKey) headers["X-API-Key"] = config.qrApiKey;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: ctrl.signal,
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    } catch (err) {
        if (err.name === "AbortError") {
            return { ok: false, status: 504, data: { detail: `QR orchestrator timeout (${timeoutMs} ms)` } };
        }
        return { ok: false, status: 502, data: { detail: `QR orchestrator error: ${err.message}` } };
    } finally {
        clearTimeout(t);
    }
};

// Convierte el Payment del orquestador al shape que entiende el frontend/back actual.
// Mantiene el shape original tambien para los consumidores nuevos.
const mapPayment = (p) => {
    if (!p || typeof p !== "object") return p;
    const amount =
        p.amount_to_pay != null ? Number(p.amount_to_pay) : Number(p.requested_amount);
    return {
        // shape nuevo
        id: p.id,
        status: p.status,
        provider: p.provider,
        provider_label: p.provider_label,
        validation_method: p.validation_method,
        requested_amount: Number(p.requested_amount) || 0,
        amount_to_pay: p.amount_to_pay != null ? Number(p.amount_to_pay) : null,
        estimated_seconds: p.estimated_seconds || 0,
        failover_count: p.failover_count || 0,
        attempts: p.attempts || [],
        notification: p.notification || null,
        error: p.error || "",
        // alias compat con UI/back antiguo
        payment_id: p.id,
        amount: Number.isFinite(amount) ? amount : 0,
        code: p.code || "",
        qr_payload: p.qr_payload || "",
        description: p.description || "",
        created_at: p.created_at,
        expires_at: p.expires_at,
        paid_at: p.paid_at || null,
        callback_url: p.callback_url || null,
        batch_id: p.batch_id || null,
    };
};

// Genera un QR. Devuelve inmediatamente con `status=creating` + ETA.
// `callbackUrl` recibira webhooks (event=created|qr_ready|paid|failover|failed|expired).
const generate = async ({ amount, description, expiresIn = 600, callbackUrl } = {}) => {
    const { ok, status, data } = await orchFetch("/api/qr/generate", {
        method: "POST",
        body: {
            amount: Number(amount),
            description: description || "",
            expires_in: Number(expiresIn) || 600,
            callback_url: callbackUrl || undefined,
        },
        // timeout corto: el orquestador responde rapido con la ETA
        timeoutMs: 15_000,
    });
    return { ok, status, payment: ok ? mapPayment(data) : null, raw: data };
};

const get = async (id) => {
    const { ok, status, data } = await orchFetch(`/api/qr/${id}`);
    return { ok, status, payment: ok ? mapPayment(data) : null, raw: data };
};

const cancel = async (id) => {
    const { ok, status, data } = await orchFetch(`/api/qr/${id}/cancel`, { method: "POST" });
    return { ok, status, payment: ok ? mapPayment(data) : null, raw: data };
};

const list = async (params = {}) => {
    const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null && v !== "")
    ).toString();
    const path = `/api/qr/list${qs ? `?${qs}` : ""}`;
    const { ok, status, data } = await orchFetch(path);
    const items = Array.isArray(data?.items) ? data.items.map(mapPayment) : [];
    return { ok, status, items, raw: data };
};

const health = async () => {
    const { ok, status, data } = await orchFetch("/api/health", { timeoutMs: 5_000 });
    return { ok, status, data };
};

// Espera (polling) a que el QR pase de "creating" a "pending"/"paid".
// Util cuando no podemos depender del webhook (modo standalone del bot).
// maxMs: tiempo total maximo a esperar. intervalMs: pausa entre polls.
const waitForQrReady = async (id, { maxMs = 180_000, intervalMs = 2_500 } = {}) => {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
        const { ok, payment } = await get(id);
        if (!ok || !payment) {
            await new Promise((r) => setTimeout(r, intervalMs));
            continue;
        }
        if (payment.status !== "creating") return payment;
        await new Promise((r) => setTimeout(r, intervalMs));
    }
    return null;
};

module.exports = {
    generate,
    get,
    cancel,
    list,
    health,
    waitForQrReady,
    mapPayment,
    orchFetch,
};
