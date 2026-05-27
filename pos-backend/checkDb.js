const mongoose = require("mongoose");
require("dotenv").config();

async function run() {
  try {
    console.log("Connecting to:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!");

    // Models
    const User = require("./models/userModel");
    const Category = require("./models/categoryModel");
    const Dish = require("./models/dishModel");
    const Insumo = require("./models/insumoModel");

    const usersCount = await User.countDocuments();
    const categoriesCount = await Category.countDocuments();
    const dishesCount = await Dish.countDocuments();
    const insumosCount = await Insumo.countDocuments();

    console.log("--- DB SUMMARY ---");
    console.log(`Users: ${usersCount}`);
    console.log(`Categories: ${categoriesCount}`);
    console.log(`Dishes: ${dishesCount}`);
    console.log(`Insumos: ${insumosCount}`);

    console.log("\n--- USERS ---");
    const users = await User.find({}, "name email role");
    console.log(users);

    console.log("\n--- CATEGORIES ---");
    const categories = await Category.find();
    console.log(categories);

    console.log("\n--- DISHES (first 5) ---");
    const dishes = await Dish.find().limit(5).populate("category", "name");
    console.log(dishes);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected!");
  }
}

run();
