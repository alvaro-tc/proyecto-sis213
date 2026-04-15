const express = require("express");
const { getMetrics } = require("../controllers/metricsController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

router.get("/", isVerifiedUser, getMetrics);

module.exports = router;
