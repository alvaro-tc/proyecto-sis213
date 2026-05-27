const express = require("express");
const { addOrder, getOrders, getOrderById, updateOrder, getMyOrders, markOrderPaid, getCustomers } = require("../controllers/orderController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const validate = require("../middlewares/validate");
const { orderSchema, orderUpdateSchema } = require("../schemas");
const router = express.Router();

router.route("/").post(isVerifiedUser, validate(orderSchema), addOrder);
router.route("/").get(isVerifiedUser, getOrders);
router.route("/my").get(isVerifiedUser, getMyOrders);
router.route("/customers/search").get(isVerifiedUser, getCustomers);
router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, validate(orderUpdateSchema), updateOrder);
router.route("/:id/confirm-payment").post(isVerifiedUser, markOrderPaid);

module.exports = router;
