const mongoose = require("mongoose");

const consumoSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  cantidad: { type: Number, required: true },
  costo: { type: Number, required: true },
  descripcion: { type: String, default: "" },
});

const insumoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    unidad: { type: String, required: true, trim: true }, // kg, L, und, g, ml
    stock: { type: Number, required: true, min: 0 },
    stockMinimo: { type: Number, required: true, min: 0 },
    stockMaximo: { type: Number, required: true, min: 0 },
    costoUnitario: { type: Number, required: true, min: 0 },
    categoria: { type: String, default: "General", trim: true },
    proveedor: { type: String, default: "", trim: true },
    consumos: [consumoSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Insumo", insumoSchema);
