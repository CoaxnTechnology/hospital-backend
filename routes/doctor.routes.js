const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const doctorController = require("../controller/doctor.controller");
const { verifyToken, allowRoles } = require("../middlewares/auth.middleware");

/**
 * ======================
 * LOCAL STORAGE (DOCTOR IMAGE)
 * ======================
 */
const doctorStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/doctors");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const uploadDoctor = multer({ storage: doctorStorage });

/**
 * ======================
 * LOCAL STORAGE (SIGNATURE)
 * ======================
 */
const signatureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/signatures");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const uploadSignature = multer({ storage: signatureStorage });

/**
 * ======================
 * 🔐 PRIVATE ROUTES (TOP PRIORITY)
 * ======================
 */
router.get(
  "/private",
  verifyToken,
  allowRoles("admin", "doctor"),
  doctorController.getPrivateDoctors,
);

/**
 * ======================
 * SPECIAL ROUTES
 * ======================
 */
router.post(
  "/addschedule",
  verifyToken,
  allowRoles("doctor", "admin"),
  doctorController.addDoctorSchedule,
);

router.get("/schedule", verifyToken, doctorController.getDoctorSchedule);

/**
 * ======================
 * FILTER (BEFORE :id)
 * ======================
 */
router.get("/department/:department", doctorController.getDoctorsByDepartment);

/**
 * ======================
 * PUBLIC ROUTE
 * ======================
 */
router.get("/", doctorController.getAllDoctors);

/**
 * ======================
 * DOCTOR CRUD
 * ======================
 */
router.post(
  "/",
  verifyToken,
  allowRoles("admin"),
  uploadDoctor.single("image"),
  doctorController.createDoctor,
);

/**
 * ⚠️ IMPORTANT: dynamic routes LAST
 */
router.get("/:id/slots", doctorController.getDoctorSlots);

router.get(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  doctorController.getDoctorById,
);

router.put(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  uploadDoctor.single("image"),
  doctorController.updateDoctor,
);

router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  doctorController.deleteDoctor,
);

/**
 * ======================
 * SIGNATURE
 * ======================
 */
router.post(
  "/signature",
  verifyToken,
  allowRoles("doctor", "admin"),
  uploadSignature.single("signature"),
  doctorController.uploadSignature,
);

router.get(
  "/signature",
  verifyToken,
  allowRoles("doctor", "admin", "staff"),
  doctorController.getSignature,
);

module.exports = router;
