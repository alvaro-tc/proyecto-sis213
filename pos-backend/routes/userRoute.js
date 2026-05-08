const express = require("express");
const { register, login, getUserData, logout, getUsers, deleteUser } = require("../controllers/userController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const { authLimiter } = require("../middlewares/rateLimiters");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../schemas");
const router = express.Router();

router.route("/register").post(authLimiter, validate(registerSchema), register);
router.route("/login").post(authLimiter, validate(loginSchema), login);
router.route("/logout").post(isVerifiedUser, logout);

router.route("/").get(isVerifiedUser, getUserData);
router.route("/all").get(isVerifiedUser, getUsers);
router.route("/:id").delete(isVerifiedUser, deleteUser);

module.exports = router;
