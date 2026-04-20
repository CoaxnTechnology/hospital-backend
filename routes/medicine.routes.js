const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const medicineController = require("../controller/medicine.controller");
const { verifyToken, allowRoles } = require("../middlewares/auth.middleware");

/**
 * ======================
 * LOCAL STORAGE (EXCEL)
 * ======================
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/excel"); // folder
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.includes("excel") ||
      file.originalname.endsWith(".csv") ||
      file.originalname.endsWith(".xlsx")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel/CSV allowed"));
    }
  },
});
/**
 * ======================
 * CREATE MEDICINE
 * ======================
 */
router.post(
  "/",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  medicineController.createMedicine,
);

/**
 * ======================
 * GET ALL MEDICINES
 * ======================
 */
router.get(
  "/",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  medicineController.getAllMedicine,
);

/**
 * ======================
 * SEARCH MEDICINE
 * ======================
 */
router.get(
  "/search",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  medicineController.searchMedicine,
);

/**
 * ======================
 * GET MEDICINE BY ID
 * ======================
 */
router.get(
  "/:id",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  medicineController.getMedicineById,
);

/**
 * ======================
 * UPDATE MEDICINE
 * ======================
 */
router.put(
  "/:id",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  medicineController.updateMedicine,
);

/**
 * ======================
 * DELETE MEDICINE
 * ======================
 */
router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin", "doctor"),
  medicineController.deleteMedicine,
);

/**
 * ======================
 * SELL MEDICINE
 * ======================
 */
router.post(
  "/sell",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  medicineController.sellMedicine,
);

/**
 * ======================
 * RETURN MEDICINE
 * ======================
 */
router.post(
  "/return",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  medicineController.returnMedicine,
);

/**
 * ======================
 * LOW STOCK
 * ======================
 */
router.get(
  "/low-stock",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  medicineController.getLowStock,
);

/**
 * ======================
 * EXPIRING SOON
 * ======================
 */
router.get(
  "/expiring",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  medicineController.getExpiringSoon,
);

/**
 * ======================
 * TOTAL STOCK VALUE
 * ======================
 */
router.get(
  "/stock-value",
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  medicineController.getStockValue,
);

/**
 * ======================
 * BULK EXCEL UPLOAD (LOCAL)
 * ======================
 */
router.post(
  "/upload-excel",
  upload.single("file"), // 🔥 FIRST
  verifyToken,
  allowRoles("admin", "staff", "doctor"),
  medicineController.uploadExcel,
);

module.exports = router;
