const Dish = require("../models/dishModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

const addDish = async (req, res, next) => {
  try {
    const { name, price, category, type, insumosRequeridos } = req.body;
    if (!name || !price || !category) return next(createHttpError(400, "Missing required fields"));

    const newDish = new Dish({ name, price, category, type, insumosRequeridos: insumosRequeridos || [] });
    await newDish.save();
    res.status(201).json({ success: true, message: "Dish added", data: newDish });
  } catch (error) {
    next(error);
  }
};

const getDishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find()
      .populate("category", "name bgColor icon")
      .populate("insumosRequeridos.insumo", "nombre unidad");
    res.status(200).json({ success: true, data: dishes });
  } catch (error) {
    next(error);
  }
};

const updateDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(createHttpError(404, "Invalid id"));

    const dish = await Dish.findByIdAndUpdate(id, req.body, { new: true })
      .populate("insumosRequeridos.insumo", "nombre unidad");
    if (!dish) return next(createHttpError(404, "Dish not found"));

    res.status(200).json({ success: true, message: "Dish updated", data: dish });
  } catch (error) {
    next(error);
  }
};

const deleteDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(createHttpError(404, "Invalid id"));

    const dish = await Dish.findByIdAndDelete(id);
    if (!dish) return next(createHttpError(404, "Dish not found"));

    res.status(200).json({ success: true, message: "Dish deleted", data: dish });
  } catch (error) {
    next(error);
  }
};

module.exports = { addDish, getDishes, updateDish, deleteDish };
