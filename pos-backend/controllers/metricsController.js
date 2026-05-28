const Order = require("../models/orderModel");
const Category = require("../models/categoryModel");
const Dish = require("../models/dishModel");
const Table = require("../models/tableModel");
const User = require("../models/userModel");

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const getMetrics = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
    const monthStart = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));

    const [
      totalOrders,
      totalCategories,
      totalDishes,
      totalTables,
      bookedTables,
      totalCustomers,
      totalEmployees,
      orders,
    ] = await Promise.all([
      Order.countDocuments(),
      Category.countDocuments(),
      Dish.countDocuments(),
      Table.countDocuments(),
      Table.countDocuments({ status: "Booked" }),
      User.countDocuments({ role: { $regex: "^customer$", $options: "i" } }),
      User.countDocuments({ role: { $not: { $regex: "^customer$", $options: "i" } } }),
      Order.find().lean(),
    ]);

    const completedOrders = orders.filter((o) => o.orderStatus === "Completed");
    const totalRevenue = completedOrders.reduce((s, o) => s + (o.bills?.totalWithTax || 0), 0);

    const todayOrders = completedOrders.filter((o) => new Date(o.orderDate) >= todayStart);
    const weekOrders = completedOrders.filter((o) => new Date(o.orderDate) >= weekStart);
    const monthOrders = completedOrders.filter((o) => new Date(o.orderDate) >= monthStart);

    const sumRevenue = (list) => list.reduce((s, o) => s + (o.bills?.totalWithTax || 0), 0);
    const todayRevenue = sumRevenue(todayOrders);
    const weekRevenue = sumRevenue(weekOrders);
    const monthRevenue = sumRevenue(monthOrders);

    const avgTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    const avgTicketToday = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

    // Orders by status
    const statusBuckets = { "In Progress": 0, Ready: 0, Completed: 0, Cancelled: 0 };
    orders.forEach((o) => {
      if (statusBuckets[o.orderStatus] !== undefined) statusBuckets[o.orderStatus]++;
    });
    const completedRate = totalOrders > 0 ? (statusBuckets.Completed / totalOrders) * 100 : 0;
    const cancelledRate = totalOrders > 0 ? (statusBuckets.Cancelled / totalOrders) * 100 : 0;

    // Revenue / orders last 7 days (solo órdenes completadas)
    const dailySeries = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = startOfDay(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const list = completedOrders.filter(
        (o) => new Date(o.orderDate) >= dayStart && new Date(o.orderDate) < dayEnd
      );
      dailySeries.push({
        date: dayStart.toISOString().slice(0, 10),
        revenue: +sumRevenue(list).toFixed(2),
        orders: list.length,
      });
    }

    // Hourly distribution (today; fallback last 7d if no orders today)
    const hourlySource = todayOrders.length > 0 ? todayOrders : weekOrders;
    const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: h, orders: 0, revenue: 0 }));
    hourlySource.forEach((o) => {
      const h = new Date(o.orderDate).getHours();
      hourly[h].orders++;
      hourly[h].revenue += o.bills?.totalWithTax || 0;
    });
    const peakHour = hourly.reduce((best, h) => (h.orders > best.orders ? h : best), hourly[0]);

    // Top dishes (solo órdenes completadas)
    const dishCounter = {};
    completedOrders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const name = it?.name || it?.dishName || it?.title || "Sin nombre";
        const qty = Number(it?.quantity || it?.qty || 1);
        const price = Number(it?.price || it?.pricePerQuantity || 0);
        if (!dishCounter[name]) dishCounter[name] = { name, quantity: 0, revenue: 0 };
        dishCounter[name].quantity += qty;
        dishCounter[name].revenue += price * qty;
      });
    });
    const topDishes = Object.values(dishCounter)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((d) => ({ ...d, revenue: +d.revenue.toFixed(2) }));

    // Payment methods (solo órdenes completadas)
    const paymentBuckets = {};
    completedOrders.forEach((o) => {
      const k = o.paymentMethod || "Sin registrar";
      if (!paymentBuckets[k]) paymentBuckets[k] = { method: k, count: 0, revenue: 0 };
      paymentBuckets[k].count++;
      paymentBuckets[k].revenue += o.bills?.totalWithTax || 0;
    });
    const paymentMethods = Object.values(paymentBuckets)
      .map((p) => ({ ...p, revenue: +p.revenue.toFixed(2) }))
      .sort((a, b) => b.revenue - a.revenue);

    const occupancyRate = totalTables > 0 ? (bookedTables / totalTables) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        // Totales
        totalOrders,
        totalCategories,
        totalDishes,
        totalTables,
        bookedTables,
        totalCustomers,
        totalEmployees,
        totalRevenue: +totalRevenue.toFixed(2),
        // Ventanas
        todayRevenue: +todayRevenue.toFixed(2),
        todayOrders: todayOrders.length,
        weekRevenue: +weekRevenue.toFixed(2),
        weekOrders: weekOrders.length,
        monthRevenue: +monthRevenue.toFixed(2),
        monthOrders: monthOrders.length,
        // Tickets
        avgTicket: +avgTicket.toFixed(2),
        avgTicketToday: +avgTicketToday.toFixed(2),
        // Estados
        ordersByStatus: statusBuckets,
        completedRate: +completedRate.toFixed(1),
        cancelledRate: +cancelledRate.toFixed(1),
        // Series
        dailySeries,
        hourly,
        peakHour,
        // Top
        topDishes,
        paymentMethods,
        // Mesas
        occupancyRate: +occupancyRate.toFixed(1),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMetrics };
