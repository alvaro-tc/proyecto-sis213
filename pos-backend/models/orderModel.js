const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerDetails: {
        name: { type: String, default: "Cliente" },
        phone: { type: String, default: "" },
        guests: { type: Number, default: 1 },
    },
    orderStatus: {
        type: String,
        enum: ["Pending Payment", "In Progress", "Preparing", "Ready", "Completed", "Cancelled"],
        default: "In Progress",
        required: true
    },
    orderDate: {
        type: Date,
        default : Date.now
    },
    bills: {
        total: { type: Number, required: true },
        tax: { type: Number, required: true },
        totalWithTax: { type: Number, required: true }
    },
    items: [],
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    orderType: {
        type: String,
        enum: ["dine-in", "takeaway"],
        default: "dine-in"
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentMethod: String,
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    // paymentData es flexible — guarda los IDs/codigos que devuelve el
    // orquestador QR (api_generador_qr) sin acoplarse a un banco especifico.
    // Campos canonicos:
    //   qr_payment_id, qr_code, qr_provider, qr_amount_to_pay, qr_amount_paid,
    //   qr_paid_at, qr_status, qr_failover_count
    // Se conservan los alias yape_* para compatibilidad con codigo antiguo.
    paymentData: {
        type: mongoose.Schema.Types.Mixed,
        default: () => ({}),
    }
}, { timestamps : true } );

module.exports = mongoose.model("Order", orderSchema);