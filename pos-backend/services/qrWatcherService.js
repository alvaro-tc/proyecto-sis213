// Watcher de respaldo para pagos QR. Aunque el orquestador api_generador_qr
// nos avisa por webhook (event=paid / failover / expired), este watcher hace
// polling cada N segundos por dos razones:
//   1. Si QR_PUBLIC_WEBHOOK_URL no esta configurado (ej. desarrollo local sin
//      tunel), los webhooks no llegan al backend.
//   2. Robustez: si un webhook se pierde, eventualmente reconciliamos el
//      estado contra el orquestador.

const Order = require("../models/orderModel");
const orchestrator = require("./qrOrchestratorService");
const { notifyOrderPaid, notifyOrderStatus } = require("./whatsappService");

const TIMEOUT_LIMIT_MS = 15 * 60 * 1000; // hard timeout: 15 min sin pago

const checkPendingPayments = async () => {
    try {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const pending = await Order.find({
            paymentStatus: "pending",
            createdAt: { $gte: twoHoursAgo },
            $or: [
                { "paymentData.qr_payment_id": { $exists: true, $ne: null } },
                { "paymentData.yape_payment_id": { $exists: true, $ne: null } },
            ],
        });
        if (!pending.length) return;

        for (const order of pending) {
            const pid =
                order.paymentData?.qr_payment_id || order.paymentData?.yape_payment_id;
            if (!pid) continue;

            const elapsed = Date.now() - order.createdAt.getTime();
            if (elapsed > TIMEOUT_LIMIT_MS) {
                console.log(`[qr-watcher] Orden ${order._id} timeout (>15min). Cancelando…`);
                try { await orchestrator.cancel(pid); } catch (_) {}
                order.paymentStatus = "failed";
                order.orderStatus = "Cancelled";
                order.paymentData = { ...(order.paymentData || {}), qr_status: "expired" };
                await order.save();
                try { notifyOrderStatus(order, "Cancelled"); } catch (_) {}
                continue;
            }

            const { ok, payment } = await orchestrator.get(pid);
            if (!ok || !payment) continue;

            if (payment.status === "paid") {
                console.log(`[qr-watcher] Pago confirmado para orden ${order._id} (provider=${payment.provider}).`);
                order.paymentStatus = "paid";
                if (order.orderStatus === "Pending Payment") {
                    order.orderStatus = "In Progress";
                }
                order.paymentData = {
                    ...(order.paymentData || {}),
                    qr_payment_id: pid,
                    qr_code: payment.code,
                    qr_provider: payment.provider,
                    qr_amount_paid: payment.amount,
                    qr_paid_at: payment.paid_at ? new Date(payment.paid_at) : new Date(),
                    qr_status: "paid",
                    yape_payment_id: pid,
                    yape_code: payment.code,
                    yape_amount: payment.amount,
                    yape_paid_at: payment.paid_at ? new Date(payment.paid_at) : new Date(),
                };
                await order.save();
                try { notifyOrderPaid(order); } catch (_) {}
            } else if (["expired", "cancelled", "failed"].includes(payment.status)) {
                console.log(`[qr-watcher] Cobro ${pid} cambio a '${payment.status}'.`);
                order.paymentStatus = "failed";
                order.orderStatus = "Cancelled";
                order.paymentData = { ...(order.paymentData || {}), qr_status: payment.status };
                await order.save();
                try { notifyOrderStatus(order, "Cancelled"); } catch (_) {}
            } else if (payment.status === "creating" || payment.status === "pending") {
                // Refrescamos algunos campos por si el orquestador hizo failover.
                const next = {
                    qr_payment_id: pid,
                    qr_provider: payment.provider,
                    qr_code: payment.code,
                    qr_amount_to_pay: payment.amount_to_pay,
                    qr_failover_count: payment.failover_count,
                    qr_status: payment.status,
                };
                let changed = false;
                for (const k of Object.keys(next)) {
                    if (next[k] != null && order.paymentData?.[k] !== next[k]) changed = true;
                }
                if (changed) {
                    order.paymentData = { ...(order.paymentData || {}), ...next };
                    await order.save();
                }
            }
        }
    } catch (err) {
        console.error("[qr-watcher] error:", err.message);
    }
};

let watcherInterval = null;
const start = (intervalMs = 5000) => {
    if (watcherInterval) return;
    console.log(`[qr-watcher] Iniciando watcher cada ${intervalMs}ms`);
    watcherInterval = setInterval(checkPendingPayments, intervalMs);
};
const stop = () => {
    if (watcherInterval) {
        clearInterval(watcherInterval);
        watcherInterval = null;
    }
};

module.exports = { start, stop, checkPendingPayments };
