const createHttpError = require("http-errors");
const config = require("../config/config");
const Order = require("../models/orderModel");
const orchestrator = require("../services/qrOrchestratorService");
const wa = require("../services/whatsapp");

// ───────── Orquestador QR (api_generador_qr — Django :8500) ─────────
// Reemplaza al microservicio MSC standalone. Acepta varios bancos (MSC, ZAS)
// con failover automatico. Para mantener compatibilidad con el frontend
// existente, los endpoints siguen exponiendose como /api/payment/yape/*
// pero ahora apuntan al orquestador y devuelven Payment unificado.

const buildCallbackUrl = () => {
    if (!config.qrPublicWebhookUrl) return undefined;
    // qrWebhookSecret se pasa como query (el orquestador no firma payloads).
    const sep = config.qrPublicWebhookUrl.includes("?") ? "&" : "?";
    return config.qrWebhookSecret
        ? `${config.qrPublicWebhookUrl}${sep}secret=${encodeURIComponent(config.qrWebhookSecret)}`
        : config.qrPublicWebhookUrl;
};

const createYapePayment = async (req, res, next) => {
    try {
        const { amount, description, expires_in } = req.body || {};
        if (!amount || Number(amount) <= 0) {
            return next(createHttpError(400, "Monto invalido"));
        }
        const { ok, status, payment, raw } = await orchestrator.generate({
            amount: Number(amount),
            description: description || "Cafeteria Aromatica",
            expiresIn: Number(expires_in) || 600,
            callbackUrl: buildCallbackUrl(),
        });
        if (!ok || !payment) {
            return next(
                createHttpError(status || 502, raw?.detail || raw?.error || "Error al generar QR")
            );
        }
        return res.status(200).json({ success: true, payment });
    } catch (err) {
        console.error("createYapePayment:", err.message);
        next(createHttpError(502, "No se pudo contactar el orquestador de QR"));
    }
};

const queryYapePayment = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        if (!paymentId) return next(createHttpError(400, "paymentId requerido"));
        const { ok, status, payment, raw } = await orchestrator.get(paymentId);
        if (!ok || !payment) {
            return next(
                createHttpError(status || 502, raw?.detail || "Cobro no encontrado")
            );
        }
        return res.json({ success: true, payment });
    } catch (err) {
        next(createHttpError(502, "No se pudo contactar el orquestador de QR"));
    }
};

const cancelYapePayment = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const { ok, status, payment, raw } = await orchestrator.cancel(paymentId);
        if (!ok || !payment) {
            return next(
                createHttpError(status || 502, raw?.detail || "No se pudo cancelar")
            );
        }
        return res.json({ success: true, payment });
    } catch (err) {
        next(createHttpError(502, "No se pudo contactar el orquestador de QR"));
    }
};

// Envia el QR de un cobro al WhatsApp del cliente. Si todavia esta en
// `creating` espera (con polling) hasta que el orquestador lo materialice.
// Body: { phone, customerName? }
const sendYapeQrToWhatsApp = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const { phone, customerName } = req.body || {};
        if (!paymentId) return next(createHttpError(400, "paymentId requerido"));
        if (!phone) return next(createHttpError(400, "phone requerido"));

        let { ok, status, payment, raw } = await orchestrator.get(paymentId);
        if (!ok) return next(createHttpError(status || 502, raw?.detail || "Cobro no encontrado"));

        if (payment.status === "creating") {
            // Avisar primero al cliente con la ETA
            wa.sendQrEtaNotice({
                phone,
                etaSeconds: payment.estimated_seconds,
                providerLabel: payment.provider_label,
                amount: payment.amount,
                customerName,
            }).catch(() => {});
            const waited = await orchestrator.waitForQrReady(paymentId, { maxMs: 180_000 });
            if (waited) payment = waited;
        }

        if (!payment.qr_payload) {
            return next(createHttpError(400, "El cobro no tiene QR disponible"));
        }
        if (payment.status && !["pending", "paid"].includes(payment.status)) {
            return next(
                createHttpError(400, `El cobro esta en estado '${payment.status}', no se puede compartir QR`)
            );
        }

        const result = await wa.sendYapePaymentQr({
            phone,
            qrPayload: payment.qr_payload,
            amount: payment.amount,
            paymentId: payment.payment_id,
            code: payment.code,
            customerName,
            provider: payment.provider,
            providerLabel: payment.provider_label,
            validationMethod: payment.validation_method,
        });

        if (!result.ok) {
            return res.status(502).json({ success: false, error: result.error || "Envio fallido" });
        }
        return res.json({ success: true, id: result.id, payment });
    } catch (err) {
        console.error("sendYapeQrToWhatsApp:", err.message);
        next(createHttpError(502, "No se pudo enviar el QR por WhatsApp"));
    }
};

// GET /api/payment/qr/health — estado del orquestador (todos los bancos)
const qrHealth = async (req, res) => {
    try {
        const { ok, status, data } = await orchestrator.health();
        return res.json({ reachable: ok, status, ...data });
    } catch (err) {
        return res.status(500).json({ reachable: false, error: err.message });
    }
};

// Alias legacy para no romper frontend antiguo que llamaba a getMscHealth.
const mscHealth = qrHealth;

// ─── Webhook receiver ────────────────────────────────────────────────
// El orquestador llama aqui con events: created, qr_ready, paid, failover,
// failed, expired. Buscamos el Order asociado por paymentData.qr_payment_id
// y actualizamos su estado. Idempotente.
const qrWebhook = async (req, res, next) => {
    try {
        // Verificacion de secreto via query (el orquestador no firma).
        if (config.qrWebhookSecret) {
            const provided = req.query?.secret || req.header("x-webhook-secret");
            if (provided !== config.qrWebhookSecret) {
                return res.status(401).json({ ok: false, error: "secret invalido" });
            }
        }
        const event = req.body || {};
        const paymentId = event.payment_id;
        if (!paymentId) {
            return res.status(400).json({ ok: false, error: "payment_id requerido" });
        }

        const order = await Order.findOne({ "paymentData.qr_payment_id": paymentId });

        // Si no encontramos un Order asociado, devolvemos 200 igual para que el
        // orquestador no reintente (el cobro puede pertenecer a otro consumidor).
        if (!order) {
            console.log(`[qr-webhook] payment_id=${paymentId} sin Order asociado (event=${event.event})`);
            return res.json({ ok: true, matched: false });
        }

        const phone = order.customerDetails?.phone;
        const name = order.customerDetails?.name;

        switch (event.event) {
            case "qr_ready": {
                order.paymentData = {
                    ...(order.paymentData || {}),
                    qr_payment_id: paymentId,
                    qr_code: event.code,
                    qr_provider: event.provider,
                    qr_amount_to_pay: event.amount_to_pay,
                    qr_status: "pending",
                };
                await order.save();
                // Reenviar QR al cliente si tenemos qr_payload (pidiendo detalle).
                try {
                    const { payment } = await orchestrator.get(paymentId);
                    if (payment?.qr_payload && phone) {
                        wa.sendYapePaymentQr({
                            phone,
                            qrPayload: payment.qr_payload,
                            amount: payment.amount,
                            paymentId,
                            code: payment.code,
                            customerName: name,
                            provider: payment.provider,
                            providerLabel: payment.provider_label,
                            validationMethod: payment.validation_method,
                        }).catch(() => {});
                    }
                } catch (_) {}
                break;
            }
            case "paid": {
                order.paymentStatus = "paid";
                if (order.orderStatus === "Pending Payment") {
                    order.orderStatus = "In Progress";
                }
                order.paymentData = {
                    ...(order.paymentData || {}),
                    qr_payment_id: paymentId,
                    qr_code: event.code,
                    qr_provider: event.provider,
                    qr_amount_paid: event.amount_to_pay,
                    qr_paid_at: event.paid_at ? new Date(event.paid_at) : new Date(),
                    qr_status: "paid",
                    // alias yape_* para compat con codigo antiguo
                    yape_payment_id: paymentId,
                    yape_code: event.code,
                    yape_amount: event.amount_to_pay,
                    yape_paid_at: event.paid_at ? new Date(event.paid_at) : new Date(),
                };
                await order.save();
                wa.notifyOrderPaid(order);
                break;
            }
            case "failover": {
                if (phone) {
                    wa.sendQrFailoverNotice({
                        phone,
                        failedProvider: event.failed_provider,
                        nextProvider: event.next_provider,
                        newEtaSeconds: event.new_estimated_seconds,
                    }).catch(() => {});
                }
                order.paymentData = {
                    ...(order.paymentData || {}),
                    qr_provider: event.next_provider,
                    qr_failover_count: (order.paymentData?.qr_failover_count || 0) + 1,
                };
                await order.save();
                break;
            }
            case "failed":
            case "expired": {
                order.paymentStatus = "failed";
                if (order.orderStatus === "Pending Payment") {
                    order.orderStatus = "Cancelled";
                }
                order.paymentData = {
                    ...(order.paymentData || {}),
                    qr_status: event.event,
                };
                await order.save();
                wa.notifyOrderStatus(order, "Cancelled");
                break;
            }
            default:
                // 'created' u otros: nada por hacer aqui, la creacion ya se
                // habia registrado al lanzar generate().
                break;
        }

        return res.json({ ok: true, matched: true });
    } catch (err) {
        console.error("qrWebhook:", err.message);
        next(err);
    }
};

module.exports = {
    createYapePayment,
    queryYapePayment,
    cancelYapePayment,
    sendYapeQrToWhatsApp,
    qrHealth,
    mscHealth,
    qrWebhook,
};
