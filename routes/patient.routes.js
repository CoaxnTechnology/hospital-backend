const express = require("express");
const router = express.Router();

const patientController = require("../controller/patient.controller");
const { verifyToken, allowRoles } = require("../middlewares/auth.middleware");

/**
 * ======================
 * GET ALL PATIENTS
 * admin + staff + doctor
 * ======================
 */
router.get(
  "/",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  patientController.getPatients
);

/**
 * ======================
 * GET PATIENT BY ID
 * admin + staff + doctor
 * ======================
 */
router.get(
  "/:id",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  patientController.getPatient
);

/**
 * ======================
 * GET PATIENT HISTORY
 * admin + staff + doctor
 * ======================
 */
router.get(
  "/:id/history",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  patientController.patientHistory
);
router.post("/history/phone", patientController.getPatientHistoryByPhone);
module.exports = router;
