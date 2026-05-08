const express = require("express");
const { addTable, getTables, updateTable, deleteTable } = require("../controllers/tableController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const validate = require("../middlewares/validate");
const { tableSchema, tableUpdateSchema } = require("../schemas");
const router = express.Router();

router.post("/", isVerifiedUser, validate(tableSchema), addTable);
router.get("/", isVerifiedUser, getTables);
router.put("/:id", isVerifiedUser, validate(tableUpdateSchema), updateTable);
router.delete("/:id", isVerifiedUser, deleteTable);

module.exports = router;
