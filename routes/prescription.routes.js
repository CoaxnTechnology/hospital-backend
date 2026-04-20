const express = require("express");
const router = express.Router();
const prescriptionController = require("../controller/prescription.controller");
const { verifyToken, allowRoles } = require("../middlewares/auth.middleware");

const multer = require("multer");
const path = require("path");

// 📁 Multer config (LOCAL upload)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/prescriptions"); // folder
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
const fs = require("fs");
// ✅ CREATE (with file upload)
router.post(
  "/create",
  upload.single("file"), // 👈 field name
  prescriptionController.createPrescription
);

// बाकी routes same
router.get("/:appointment_id", prescriptionController.getPrescription);

router.get(
  "/:id/medicines",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  prescriptionController.getPrescriptionMedicines
);

router.get(
  "/by-id/:id",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  prescriptionController.getPrescriptionById
);

router.get("/:id/pdf", prescriptionController.getPrescriptionPDF);

module.exports = router;