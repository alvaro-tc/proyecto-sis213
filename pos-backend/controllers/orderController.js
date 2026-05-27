const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const Dish = require("../models/dishModel");
const Insumo = require("../models/insumoModel");
const config = require("../config/config");
const { default: mongoose } = require("mongoose");
const { notifyOrderStatus, notifyOrderPaid } = require("../services/whatsappService");
const orchestrator = require("../services/qrOrchestratorService");

const _descontarInsumos = async (items) => {
  for (const item of items) {
    if (!item.dishId || !mongoose.Types.ObjectId.isValid(item.dishId)) continue;

    const dish = await Dish.findById(item.dishId).populate("insumosRequeridos.insumo");
    if (!dish || !dish.insumosRequeridos?.length) continue;

    const cantidad = item.quantity || 1;
    for (const req of dish.insumosRequeridos) {
      const insumo = await Insumo.findById(req.insumo._id || req.insumo);
      if (!insumo) continue;

      const cantidadTotal = req.cantidad * cantidad;
      const costo = cantidadTotal * insumo.costoUnitario;

      insumo.stock = Math.max(0, insumo.stock - cantidadTotal);
      insumo.consumos.push({
        cantidad: cantidadTotal,
        costo,
        descripcion: `Pedido: ${item.name} x${cantidad}`,
        fecha: new Date(),
      });
      await insumo.save();
    }
  }
};

const addOrder = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Si quien crea el pedido es un cliente, forzar reglas de seguridad:
    // - asociar el pedido a su userId
    // - obligar pago por Yape (no efectivo)
    // - bloquear que pueda marcarlo como pagado sin la verificación del backend
    if (req.user && req.user.role && req.user.role.toLowerCase() === "customer") {
      payload.customer = req.user._id;
      payload.paymentMethod = "Yape";
      payload.paymentStatus = payload.paymentStatus === "paid" ? "paid" : "pending";
      if (!payload.orderType) payload.orderType = "dine-in";
    }

    if (payload.paymentMethod === "Yape" && payload.paymentStatus !== "paid") {
      payload.orderStatus = "Pending Payment";
    }

    const order = new Order(payload);
    await order.save();

    // Descontar insumos en segundo plano (no bloquea el pedido si falla)
    _descontarInsumos(req.body.items || []).catch((err) =>
      console.error("Error al descontar insumos:", err)
    );

    if (order.paymentStatus === "paid") {
      notifyOrderPaid(order);
    } else {
      notifyOrderStatus(order, order.orderStatus || "In Progress");
    }

    res.status(201).json({ success: true, message: "Order created!", data: order });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid id!"));
    }

    const order = await Order.findById(id);
    if (!order) return next(createHttpError(404, "Order not found!"));

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("table");
    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid id!"));
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!order) return next(createHttpError(404, "Order not found!"));

    if (order.table && (orderStatus === "Completed" || orderStatus === "Cancelled")) {
      await Table.findByIdAndUpdate(order.table, {
        status: "Available",
        currentOrder: null,
      });
    }

    notifyOrderStatus(order, orderStatus);

    res.status(200).json({ success: true, message: "Order updated", data: order });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("table")
      .sort({ createdAt: -1 });
    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
};

const markOrderPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { yapePaymentId } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid id!"));
    }

    const order = await Order.findById(id);
    if (!order) return next(createHttpError(404, "Order not found!"));

    // Solo el cliente dueño del pedido (o staff) puede marcarlo
    const isOwner =
      order.customer && req.user && order.customer.toString() === req.user._id.toString();
    const role = req.user?.role?.toLowerCase();
    const isStaff = role === "admin" || role === "waiter" || role === "barista";
    if (!isOwner && !isStaff) {
      return next(createHttpError(403, "Forbidden"));
    }

    const paymentId =
      yapePaymentId ||
      order.paymentData?.qr_payment_id ||
      order.paymentData?.yape_payment_id;
    if (!paymentId) return next(createHttpError(400, "paymentId requerido"));

    const { ok, status, payment, raw } = await orchestrator.get(paymentId);
    if (!ok || !payment) {
      return next(createHttpError(status || 502, raw?.detail || "Cobro no encontrado"));
    }

    if (payment.status !== "paid") {
      return res.status(200).json({
        success: false,
        paid: false,
        message: "Pago aun no confirmado",
        status: payment.status,
        estimated_seconds: payment.estimated_seconds,
        provider: payment.provider,
      });
    }

    order.paymentStatus = "paid";
    order.paymentMethod = order.paymentMethod || "Yape";
    if (order.orderStatus === "Pending Payment") {
      order.orderStatus = "In Progress";
    }
    order.paymentData = {
      ...(order.paymentData || {}),
      qr_payment_id: paymentId,
      qr_code: payment.code,
      qr_provider: payment.provider,
      qr_amount_paid: payment.amount,
      qr_paid_at: payment.paid_at ? new Date(payment.paid_at) : new Date(),
      qr_status: "paid",
      yape_payment_id: paymentId,
      yape_code: payment.code,
      yape_amount: payment.amount,
      yape_paid_at: payment.paid_at ? new Date(payment.paid_at) : new Date(),
    };
    await order.save();

    notifyOrderPaid(order);

    res.status(200).json({ success: true, paid: true, message: "Pago confirmado", data: order });
  } catch (error) {
    next(error);
  }
};

const getCustomers = async (req, res, next) => {
  try {
    const q = (req.query.q || "").toString().trim();
    const match = {
      "customerDetails.name": { $exists: true, $ne: "" },
    };
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      match.$or = [
        { "customerDetails.name": rx },
        { "customerDetails.phone": rx },
      ];
    }
    const customers = await Order.aggregate([
      { $match: match },
      { $sort: { orderDate: -1 } },
      {
        $group: {
          _id: {
            name: { $toLower: "$customerDetails.name" },
            phone: "$customerDetails.phone",
          },
          name: { $first: "$customerDetails.name" },
          phone: { $first: "$customerDetails.phone" },
          lastOrder: { $first: "$orderDate" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { lastOrder: -1 } },
      { $limit: 30 },
      { $project: { _id: 0, name: 1, phone: 1, lastOrder: 1, orders: 1 } },
    ]);
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrder, getOrderById, getOrders, updateOrder, getMyOrders, markOrderPaid, getCustomers };
