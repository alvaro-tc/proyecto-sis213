const express = require("express");
const router = express.Router();
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const {
    createYapePayment,
    queryYapePayment,
    cancelYapePayment,
    sendYapeQrToWhatsApp,
    qrHealth,
    mscHealth,
    qrWebhook,
} = require("../controllers/paymentController");

// Health del orquestador QR (todos los bancos, MSC + ZAS + ...).
router.route("/qr/health").get(qrHealth);
router.route("/msc/health").get(mscHealth); // alias legacy

// Webhook publico: recibe eventos del orquestador (created/qr_ready/paid/failover/...).
// No requiere auth de usuario — se autentica via ?secret=<QR_WEBHOOK_SECRET>.
router.route("/qr/webhook").post(qrWebhook);

// API QR — endpoints nuevos
router.route("/qr/create").post(isVerifiedUser, createYapePayment);
router.route("/qr/:paymentId").get(isVerifiedUser, queryYapePayment);
router.route("/qr/:paymentId/cancel").post(isVerifiedUser, cancelYapePayment);
router.route("/qr/:paymentId/send-whatsapp").post(isVerifiedUser, sendYapeQrToWhatsApp);

// Alias legacy /yape/* — mismo controlador, mismo shape de respuesta.
router.route("/yape/create").post(isVerifiedUser, createYapePayment);
router.route("/yape/:paymentId").get(isVerifiedUser, queryYapePayment);
router.route("/yape/:paymentId").delete(isVerifiedUser, cancelYapePayment);
router.route("/yape/:paymentId/send-whatsapp").post(isVerifiedUser, sendYapeQrToWhatsApp);

module.exports = router;
