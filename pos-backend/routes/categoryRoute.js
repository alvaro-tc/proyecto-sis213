const express = require("express");
const { addCategory, getCategories, updateCategory, deleteCategory } = require("../controllers/categoryController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const validate = require("../middlewares/validate");
const { categorySchema } = require("../schemas");

const router = express.Router();

router.post("/", isVerifiedUser, validate(categorySchema), addCategory);
router.get("/", isVerifiedUser, getCategories);
router.put("/:id", isVerifiedUser, validate(categorySchema.partial()), updateCategory);
router.delete("/:id", isVerifiedUser, deleteCategory);

module.exports = router;
