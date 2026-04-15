const Order = require("../models/orderModel");
const Category = require("../models/categoryModel");
const Dish = require("../models/dishModel");
const Table = require("../models/tableModel");
const User = require("../models/userModel");

const getMetrics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalDishes = await Dish.countDocuments();
    const totalTables = await Table.countDocuments();
    const bookedTables = await Table.countDocuments({ status: "Booked" });
    const totalCustomers = await User.countDocuments({ role: "Customer" }); // Or based on Orders distinct customers

    // Calculate total revenue from orders
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.bills?.totalWithTax || 0), 0);

    const metrics = {
      totalOrders,
      totalCategories,
      totalDishes,
      totalTables,
      bookedTables,
      totalRevenue: totalRevenue.toFixed(2),
    };

    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMetrics };
