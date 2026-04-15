const express = require("express");
const { addDish, getDishes, updateDish, deleteDish } = require("../controllers/dishController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

router.post("/", isVerifiedUser, addDish);
router.get("/", isVerifiedUser, getDishes);
router.put("/:id", isVerifiedUser, updateDish);
router.delete("/:id", isVerifiedUser, deleteDish);

module.exports = router;
