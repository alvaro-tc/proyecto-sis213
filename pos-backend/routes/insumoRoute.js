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
const validate = require("../middlewares/validate");
const { insumoSchema, consumoSchema, reponerSchema } = require("../schemas");

const router = express.Router();

router.post("/", isVerifiedUser, validate(insumoSchema), addInsumo);
router.get("/", isVerifiedUser, getInsumos);
router.get("/metricas", isVerifiedUser, getMetricasInsumos);
router.put("/:id", isVerifiedUser, validate(insumoSchema.partial()), updateInsumo);
router.delete("/:id", isVerifiedUser, deleteInsumo);
router.post("/:id/consumo", isVerifiedUser, validate(consumoSchema), registrarConsumo);
router.post("/:id/reponer", isVerifiedUser, validate(reponerSchema), reponerStock);

module.exports = router;
