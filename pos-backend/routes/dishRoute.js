const express = require("express");
const { addDish, getDishes, updateDish, deleteDish } = require("../controllers/dishController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const validate = require("../middlewares/validate");
const { dishSchema } = require("../schemas");

const router = express.Router();

router.post("/", isVerifiedUser, validate(dishSchema), addDish);
router.get("/", isVerifiedUser, getDishes);
router.put("/:id", isVerifiedUser, validate(dishSchema.partial()), updateDish);
router.delete("/:id", isVerifiedUser, deleteDish);

module.exports = router;
