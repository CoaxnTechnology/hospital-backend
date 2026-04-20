const express = require("express");
const router = express.Router();
const brandController = require("../controller/medicineBrand.controller");

router.post("/brand", brandController.addBrand);
router.get("/brand", brandController.getBrands);
router.put("/brand/:id", brandController.updateBrand);   // ✅ edit
router.delete("/brand/:id", brandController.deleteBrand); // ✅ delete

module.exports = router;