const express = require("express");
const router = express.Router();

const departmentController = require("../controller/department.controller");
const { verifyToken, allowRoles } = require("../middlewares/auth.middleware");

/**
 * ======================
 * 🔥 HOME API (PUBLIC)
 * ======================
 * 👉 frontend use karega (no auth)
 */
router.get(
  "/home",
  departmentController.getHome
);

/**
 * ======================
 * ADD DEPARTMENT
 * ======================
 */
router.post(
  "/",
  verifyToken,
  allowRoles("admin", "doctor", "staff"),
  departmentController.createDepartment
);

/**
 * ======================
 * GET ALL DEPARTMENTS
 * ======================
 */
router.get(
  "/",
  verifyToken,
  allowRoles("admin", "doctor", "staff"),
  departmentController.getDepartments
);

/**
 * ======================
 * GET DEPARTMENT BY ID
 * ======================
 */
router.get(
  "/:id",
  verifyToken,
  allowRoles("admin", "doctor", "staff"),
  departmentController.getDepartment
);

/**
 * ======================
 * UPDATE DEPARTMENT
 * ======================
 */
router.put(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  departmentController.updateDepartment
);

/**
 * ======================
 * DELETE DEPARTMENT
 * ======================
 */
router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  departmentController.deleteDepartment
);

/**
 * ======================
 * 🔥 SECTION APIs
 * ======================
 */

// GET SECTION
router.get(
  "/section/:key",
  verifyToken,
  allowRoles("admin","doctor", "staff"),
  departmentController.getSection
);

// SAVE (ADD / UPDATE)
router.post(
  "/section/:key",
  verifyToken,
  allowRoles("admin","doctor", "staff"),
  departmentController.saveSection
);

// DELETE SECTION
router.delete(
  "/section/:key",
  verifyToken,
  allowRoles("admin","doctor", "staff"),
  departmentController.deleteSection
);

module.exports = router;