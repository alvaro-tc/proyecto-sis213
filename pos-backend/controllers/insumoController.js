const Insumo = require("../models/insumoModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

const addInsumo = async (req, res, next) => {
  try {
    const { nombre, unidad, stock, stockMinimo, stockMaximo, costoUnitario, categoria, proveedor } = req.body;
    if (!nombre || !unidad || stock == null || !stockMinimo || !stockMaximo || !costoUnitario) {
      return next(createHttpError(400, "Faltan campos requeridos"));
    }
    const insumo = new Insumo({ nombre, unidad, stock, stockMinimo, stockMaximo, costoUnitario, categoria, proveedor });
    await insumo.save();
    res.status(201).json({ success: true, message: "Insumo agregado", data: insumo });
  } catch (error) {
    next(error);
  }
};

const getInsumos = async (req, res, next) => {
  try {
    const insumos = await Insumo.find().sort({ nombre: 1 });
    res.status(200).json({ success: true, data: insumos });
  } catch (error) {
    next(error);
  }
};

const updateInsumo = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(createHttpError(404, "ID inválido"));
    const insumo = await Insumo.findByIdAndUpdate(id, req.body, { new: true });
    if (!insumo) return next(createHttpError(404, "Insumo no encontrado"));
    res.status(200).json({ success: true, message: "Insumo actualizado", data: insumo });
  } catch (error) {
    next(error);
  }
};

const deleteInsumo = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(createHttpError(404, "ID inválido"));
    const insumo = await Insumo.findByIdAndDelete(id);
    if (!insumo) return next(createHttpError(404, "Insumo no encontrado"));
    res.status(200).json({ success: true, message: "Insumo eliminado" });
  } catch (error) {
    next(error);
  }
};

const registrarConsumo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cantidad, descripcion } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(createHttpError(404, "ID inválido"));
    if (!cantidad || cantidad <= 0) return next(createHttpError(400, "Cantidad inválida"));

    const insumo = await Insumo.findById(id);
    if (!insumo) return next(createHttpError(404, "Insumo no encontrado"));
    if (insumo.stock < cantidad) return next(createHttpError(400, "Stock insuficiente"));

    const costo = cantidad * insumo.costoUnitario;
    insumo.stock -= cantidad;
    insumo.consumos.push({ cantidad, costo, descripcion: descripcion || "" });
    await insumo.save();

    res.status(200).json({ success: true, message: "Consumo registrado", data: insumo });
  } catch (error) {
    next(error);
  }
};

const reponerStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(createHttpError(404, "ID inválido"));
    if (!cantidad || cantidad <= 0) return next(createHttpError(400, "Cantidad inválida"));

    const insumo = await Insumo.findById(id);
    if (!insumo) return next(createHttpError(404, "Insumo no encontrado"));

    insumo.stock += cantidad;
    await insumo.save();

    res.status(200).json({ success: true, message: "Stock repuesto", data: insumo });
  } catch (error) {
    next(error);
  }
};

const getMetricasInsumos = async (req, res, next) => {
  try {
    const insumos = await Insumo.find();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Gasto por día (últimos 7 días)
    const gastosPorDia = [];
    for (let i = 6; i >= 0; i--) {
      const inicio = new Date(hoy);
      inicio.setDate(inicio.getDate() - i);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 1);

      let gastoDelDia = 0;
      insumos.forEach((insumo) => {
        insumo.consumos.forEach((c) => {
          const fechaConsumo = new Date(c.fecha);
          if (fechaConsumo >= inicio && fechaConsumo < fin) {
            gastoDelDia += c.costo;
          }
        });
      });

      const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      gastosPorDia.push({
        dia: diasSemana[inicio.getDay()],
        fecha: inicio.toISOString().split("T")[0],
        gasto: parseFloat(gastoDelDia.toFixed(2)),
      });
    }

    // Gasto hoy
    const gastoHoy = gastosPorDia[gastosPorDia.length - 1].gasto;

    // Alertas
    const criticos = insumos.filter((i) => i.stock < i.stockMinimo * 0.5);
    const bajos = insumos.filter((i) => i.stock >= i.stockMinimo * 0.5 && i.stock < i.stockMinimo);

    res.status(200).json({
      success: true,
      data: {
        gastoHoy,
        gastosPorDia,
        totalInsumos: insumos.length,
        criticos: criticos.length,
        bajos: bajos.length,
        insumosEnAlerta: [...criticos, ...bajos].map((i) => ({
          _id: i._id,
          nombre: i.nombre,
          stock: i.stock,
          stockMinimo: i.stockMinimo,
          unidad: i.unidad,
          estado: i.stock < i.stockMinimo * 0.5 ? "critico" : "bajo",
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addInsumo, getInsumos, updateInsumo, deleteInsumo, registrarConsumo, reponerStock, getMetricasInsumos };
