const express = require("express");
const {
  getStatus,
  getPrompt,
  savePrompt,
  resetPrompt,
  chatTest,
  whatsappWebhook,
  clearHistory,
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

module.exports = router;
