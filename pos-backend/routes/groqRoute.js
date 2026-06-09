const express = require("express");
const {
  getStatus,
  getPrompt,
  savePrompt,
  resetPrompt,
  chatTest,
  whatsappWebhook,
  clearHistory,
  listKeys,
  addKey,
  updateKey,
  deleteKey,
  checkKey,
  resetKeyUsage,
} = require("../controllers/groqController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

router.get("/status", isVerifiedUser, getStatus);
router.get("/prompt", isVerifiedUser, getPrompt);
router.put("/prompt", isVerifiedUser, savePrompt);
router.post("/prompt/reset", isVerifiedUser, resetPrompt);
router.post("/chat", isVerifiedUser, chatTest);
router.post("/history/clear", isVerifiedUser, clearHistory);

router.post("/webhook/whatsapp", whatsappWebhook);

// API Key management (admin only — enforced inside each handler)
router.get("/keys", isVerifiedUser, listKeys);
router.post("/keys", isVerifiedUser, addKey);
router.patch("/keys/:id", isVerifiedUser, updateKey);
router.delete("/keys/:id", isVerifiedUser, deleteKey);
router.post("/keys/:id/check", isVerifiedUser, checkKey);
router.post("/keys/:id/reset-usage", isVerifiedUser, resetKeyUsage);

module.exports = router;
