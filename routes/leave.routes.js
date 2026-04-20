const express = require("express");
const router = express.Router();

const leaveController = require("../controller/leave.controller");
const { verifyToken, allowRoles } = require("../middlewares/auth.middleware");

/**
 * STAFF + DOCTOR → CREATE LEAVE
 */
router.post(
  "/",
  verifyToken,
  allowRoles("staff", "doctor"),
  leaveController.createLeave
);

/**
 * STAFF + DOCTOR → MY LEAVES
 */
router.get(
  "/my",
  verifyToken,
  allowRoles("staff", "doctor"),
  leaveController.getMyLeaves
);

/**
 * ADMIN → ALL LEAVES
 */
router.get(
  "/",
  verifyToken,
  allowRoles("admin"),
  leaveController.getAllLeaves
);

/**
 * ADMIN → UPDATE STATUS
 */
router.patch(
  "/:id/status",
  verifyToken,
  allowRoles("admin"),
  leaveController.updateLeaveStatus
);

/**
 * ADMIN → NOTIFICATION COUNT
 */
router.get(
  "/notification-count",
  verifyToken,
  allowRoles("admin"),
  leaveController.getLeaveNotificationCount
);
router.patch(
  "/mark-seen",
  verifyToken,
  allowRoles("admin"),
  leaveController.markLeavesAsSeen
);

module.exports = router;