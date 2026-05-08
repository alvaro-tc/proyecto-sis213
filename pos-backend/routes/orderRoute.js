const express = require("express");
const { addOrder, getOrders, getOrderById, updateOrder } = require("../controllers/orderController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const validate = require("../middlewares/validate");
const { orderSchema, orderUpdateSchema } = require("../schemas");
const router = express.Router();

router.route("/").post(isVerifiedUser, validate(orderSchema), addOrder);
router.route("/").get(isVerifiedUser, getOrders);
router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, validate(orderUpdateSchema), updateOrder);

module.exports = router;
