const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const Dish = require("../models/dishModel");
const Insumo = require("../models/insumoModel");
const { default: mongoose } = require("mongoose");

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
    // - obligar pago por Binance (no efectivo)
    // - bloquear que pueda marcarlo como pagado sin la verificación del backend
    if (req.user && req.user.role && req.user.role.toLowerCase() === "customer") {
      payload.customer = req.user._id;
      payload.paymentMethod = "Binance";
      payload.paymentStatus = payload.paymentStatus === "paid" ? "paid" : "pending";
      if (!payload.orderType) payload.orderType = "dine-in";
    }

    const order = new Order(payload);
    await order.save();

    // Descontar insumos en segundo plano (no bloquea el pedido si falla)
    _descontarInsumos(req.body.items || []).catch((err) =>
      console.error("Error al descontar insumos:", err)
    );

    res.status(201).json({ success: true, message: "Order created!", data: order });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findById(id);
    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

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
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    // Liberar la mesa automáticamente cuando el pedido se entrega o cancela.
    if (order.table && (orderStatus === "Completed" || orderStatus === "Cancelled")) {
      await Table.findByIdAndUpdate(order.table, {
        status: "Available",
        currentOrder: null,
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Order updated", data: order });
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
    const { merchantTradeNo } = req.body || {};
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

    // Verificación real contra Binance Pay (igual que queryBinanceOrder)
    const config = require("../config/config");
    const crypto = require("crypto");
    const tradeNo = merchantTradeNo || order.paymentData?.binance_merchant_trade_no;
    if (!tradeNo) return next(createHttpError(400, "merchantTradeNo requerido"));

    let paid = false;
    if (!config.binancePayApiKey || !config.binancePaySecretKey) {
      // Mock: marca como pagado luego de 5s del timestamp en el tradeNo
      const ts = Number(String(tradeNo).slice(2, 15));
      paid = !Number.isNaN(ts) && Date.now() - ts > 5000;
    } else {
      const body = JSON.stringify({ merchantTradeNo: tradeNo });
      const timestamp = Date.now().toString();
      const nonce = crypto.randomBytes(16).toString("hex").slice(0, 32);
      const sigPayload = `${timestamp}\n${nonce}\n${body}\n`;
      const signature = crypto
        .createHmac("sha512", config.binancePaySecretKey)
        .update(sigPayload)
        .digest("hex")
        .toUpperCase();
      const url = `${config.binancePayBaseUrl}/binancepay/openapi/v2/order/query`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "BinancePay-Timestamp": timestamp,
          "BinancePay-Nonce": nonce,
          "BinancePay-Certificate-SN": config.binancePayApiKey,
          "BinancePay-Signature": signature,
        },
        body,
      });
      const data = await response.json();
      paid = data.status === "SUCCESS" && data.data?.status === "PAID";
    }

    if (!paid) {
      return res
        .status(200)
        .json({ success: false, paid: false, message: "Pago aún no confirmado" });
    }

    order.paymentStatus = "paid";
    order.paymentMethod = order.paymentMethod || "Binance";
    order.paymentData = {
      ...(order.paymentData || {}),
      binance_merchant_trade_no: tradeNo,
    };
    await order.save();

    res
      .status(200)
      .json({ success: true, paid: true, message: "Pago confirmado", data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrder, getOrderById, getOrders, updateOrder, getMyOrders, markOrderPaid };
