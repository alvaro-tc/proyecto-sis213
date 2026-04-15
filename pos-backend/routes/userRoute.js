const express = require("express");
const { register, login, getUserData, logout, getUsers, deleteUser } = require("../controllers/userController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const router = express.Router();


// Authentication Routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(isVerifiedUser, logout)

router.route("/").get(isVerifiedUser , getUserData);
router.route("/all").get(isVerifiedUser, getUsers);
router.route("/:id").delete(isVerifiedUser, deleteUser);

module.exports = router;