const express = require("express");
const router = express.Router();
const employeeController = require("../controller/employee.controller");
const { verifyToken, allowRoles } = require("../middlewares/auth.middleware");

/* ======================
   EMPLOYEE ROUTES
====================== */
/**
 * ======================
 * GET MY PROFILE
 * employee (staff) only
 * ======================
 */
router.get(
  "/me",
  verifyToken,
  allowRoles("staff"),
  employeeController.getMyProfile,
);

// Admin & staff can view
router.get(
  "/",
  verifyToken,
  allowRoles("admin", "doctor","staff"),
  employeeController.getAllEmployees,
);

router.get(
  "/:id",
  verifyToken,
  allowRoles("admin","doctor","staff"),
  employeeController.getEmployeeById,
);

// Admin only
router.put(
  "/:id",
  verifyToken,
  allowRoles("admin","doctor","staff"),
  employeeController.updateEmployee,
);

router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin","doctor","staff"),
  employeeController.deleteEmployee,
);
router.post(
  "/",
  verifyToken,
  allowRoles("admin", "doctor","staff"),
  employeeController.addEmployee,
);
router.post("/resend-reset", employeeController.resendResetLink);
module.exports = router;
