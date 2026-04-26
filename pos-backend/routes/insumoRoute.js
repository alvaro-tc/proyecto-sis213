const express = require("express");
const {
  addInsumo,
  getInsumos,
  updateInsumo,
  deleteInsumo,
  registrarConsumo,
  reponerStock,
  getMetricasInsumos,
} = require("../controllers/insumoController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

router.post("/", isVerifiedUser, addInsumo);
router.get("/", isVerifiedUser, getInsumos);
router.get("/metricas", isVerifiedUser, getMetricasInsumos);
router.put("/:id", isVerifiedUser, updateInsumo);
router.delete("/:id", isVerifiedUser, deleteInsumo);
router.post("/:id/consumo", isVerifiedUser, registrarConsumo);
router.post("/:id/reponer", isVerifiedUser, reponerStock);

module.exports = router;
