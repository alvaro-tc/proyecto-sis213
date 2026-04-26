const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
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
    const order = new Order(req.body);
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
    // Agregamos el populate (ya lo tenías, bien ahí)
    const orders = await Order.find().populate("table");

    // IMPORTANTE: Envolvé la data en un objeto que tenga 'success' y 'data'
    // para que coincida con el mapeo del frontend: resData.data.data
    res.status(200).json({ 
      success: true, 
      data: {
        data: orders  // Esto hace que en el front sea resData.data.data
      } 
    });
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

    res
      .status(200)
      .json({ success: true, message: "Order updated", data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrder, getOrderById, getOrders, updateOrder };
