const express = require("express");
const { addTable, getTables, updateTable, deleteTable } = require("../controllers/tableController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const router = express.Router();
 
router.post("/", isVerifiedUser, addTable);
router.get("/", isVerifiedUser, getTables);
router.put("/:id", isVerifiedUser, updateTable);
router.delete("/:id", isVerifiedUser, deleteTable);

module.exports = router;