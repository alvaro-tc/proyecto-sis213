const express = require("express");
const router = express.Router();
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const {
  createBinanceOrder,
  queryBinanceOrder,
  binanceWebhook,
} = require("../controllers/paymentController");

// Binance Pay
router.route("/binance/create-order").post(isVerifiedUser, createBinanceOrder);
router.route("/binance/query").post(isVerifiedUser, queryBinanceOrder);
router.route("/binance/webhook").post(binanceWebhook);


module.exports = router;