const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    bgColor: { type: String, default: "#b73e3e" },
    icon: { type: String, default: "🍲" }
});

module.exports = mongoose.model("Category", categorySchema);
