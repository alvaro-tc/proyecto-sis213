const Order = require("../models/orderModel");
const config = require("../config/config");
const { notifyOrderPaid, notifyOrderStatus } = require("./whatsappService");

// Helper para llamadas a la API de Yape Bolivia
const yapeFetch = async (path, { method = "GET", body, timeoutMs = 10000 } = {}) => {
  const url = `${config.mscApiUrl.replace(/\/$/, "")}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (config.mscApiKey) headers["X-API-Key"] = config.mscApiKey;
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
    return { ok: false, error: err.message };
  } finally {
    clearTimeout(t);
  }
};

const checkPendingPayments = async () => {
  try {
    // Buscar órdenes Yape con pago pendiente creadas en las últimas 2 horas
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const pendingOrders = await Order.find({
      paymentMethod: "Yape",
      paymentStatus: "pending",
      createdAt: { $gte: twoHoursAgo },
      "paymentData.yape_payment_id": { $exists: true, $ne: null }
    });

    if (pendingOrders.length === 0) return;

    const TIMEOUT_LIMIT_MS = 10 * 60 * 1000; // 10 minutos de tiempo de espera

    for (const order of pendingOrders) {
      const paymentId = order.paymentData.yape_payment_id;
      const timeElapsedMs = Date.now() - order.createdAt.getTime();

      // 1) Caso de Expiración/Timeout (10 minutos transcurridos sin pago)
      if (timeElapsedMs > TIMEOUT_LIMIT_MS) {
        console.log(`[yape-watcher] Orden ${order._id} superó los 10 minutos de espera sin pagar. Cancelando cobro...`);
        
        // Llamar a Yape API para cancelar el cobro y liberar slot
        const cancelRes = await yapeFetch(`/payments/${paymentId}`, { method: "DELETE" });
        if (!cancelRes.ok) {
          console.warn(`[yape-watcher] Error al cancelar cobro ${paymentId} en la API de Yape:`, cancelRes.error || cancelRes.status);
        } else {
          console.log(`[yape-watcher] Cobro ${paymentId} cancelado exitosamente en Yape API.`);
        }

        // Actualizar base de datos
        order.paymentStatus = "failed";
        order.orderStatus = "Cancelled";
        await order.save();

        // Notificar al cliente de la cancelación
        try {
          notifyOrderStatus(order, "Cancelled");
          console.log(`[yape-watcher] Notificación de cancelación de pedido enviada a ${order.customerDetails?.phone}`);
        } catch (waErr) {
          console.error(`[yape-watcher] Error al enviar notificación de cancelación por WhatsApp:`, waErr.message);
        }
        continue;
      }

      // 2) Consultar estado del pago para órdenes dentro de los 10 minutos
      const { ok, status, data } = await yapeFetch(`/payments/${paymentId}`);
      if (!ok) {
        console.warn(`[yape-watcher] Error consultando cobro ${paymentId} en Yape API: HTTP ${status}`);
        continue;
      }

      if (data.status === "paid") {
        console.log(`[yape-watcher] ¡Pago confirmado para orden ${order._id}!`);
        
        order.paymentStatus = "paid";
        order.orderStatus = "In Progress"; // Se habilita para la cocina/barista
        order.paymentData = {
          ...(order.paymentData || {}),
          yape_code: data.code,
          yape_amount: data.amount,
          yape_paid_at: data.paid_at ? new Date(data.paid_at) : new Date(),
        };

        await order.save();

        // Notificar por WhatsApp
        try {
          notifyOrderPaid(order);
          console.log(`[yape-watcher] Notificación de pago enviado por WhatsApp a ${order.customerDetails?.phone}`);
        } catch (waErr) {
          console.error(`[yape-watcher] Error enviando notificación WhatsApp:`, waErr.message);
        }
      } else if (data.status === "expired" || data.status === "cancelled" || data.status === "failed") {
        console.log(`[yape-watcher] Cobro ${paymentId} cambió a estado '${data.status}' en Yape API.`);
        order.paymentStatus = "failed";
        order.orderStatus = "Cancelled";
        await order.save();

        // Notificar cancelación
        try {
          notifyOrderStatus(order, "Cancelled");
        } catch (waErr) {
          console.error(`[yape-watcher] Error enviando notificación WhatsApp:`, waErr.message);
        }
      }
    }
  } catch (err) {
    console.error("[yape-watcher] Error en checkPendingPayments:", err.message);
  }
};

let watcherInterval = null;

const start = (intervalMs = 5000) => {
  if (watcherInterval) return;
  console.log(`[yape-watcher] Iniciando watcher de pagos Yape cada ${intervalMs}ms`);
  watcherInterval = setInterval(checkPendingPayments, intervalMs);
};

const stop = () => {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
    console.log(`[yape-watcher] Watcher de pagos Yape detenido`);
  }
};

module.exports = {
  start,
  stop,
  checkPendingPayments
};
