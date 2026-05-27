const express = require("express");
const {
    getStatus,
    getQr,
    sendTest,
    sendTestImage,
    logout,
    resetCredentials,
    switchProvider,
    metaWebhookVerify,
    metaWebhookReceive,
    getDiag,
} = require("../controllers/whatsappController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

// Panel de admin
router.get("/status", isVerifiedUser, getStatus);
router.get("/qr", isVerifiedUser, getQr);
router.post("/test", isVerifiedUser, sendTest);
router.post("/test-image", isVerifiedUser, sendTestImage);
router.post("/logout", isVerifiedUser, logout);
router.post("/reset", isVerifiedUser, resetCredentials);
router.post("/switch-provider", isVerifiedUser, switchProvider);

// Webhook Meta Cloud API — sin JWT
router.get("/webhook/meta", metaWebhookVerify);
router.post("/webhook/meta", metaWebhookReceive);

// Diagnóstico rápido — sin JWT, protegido con ?secret=BOT_WEBHOOK_SECRET
router.get("/diag", getDiag);

module.exports = router;
