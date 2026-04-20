const Leave = require("../models/leave");

/**
 * CREATE LEAVE
 */
exports.createLeave = async (req, res) => {

  try {

    const user_id = req.user.id;

    await Leave.createLeave({
      user_id,
      ...req.body
    });

    res.json({
      success: true,
      message: "Leave request submitted"
    });

  } catch (error) {

    console.error("❌ CREATE LEAVE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit leave"
    });

  }

};


/**
 * GET MY LEAVES
 */
exports.getMyLeaves = async (req, res) => {

  try {

    const user_id = req.user.id;

    const rows = await Leave.getLeavesByUser(user_id);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    console.error("❌ GET MY LEAVES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leaves"
    });

  }

};


/**
 * ADMIN → ALL LEAVES
 */
exports.getAllLeaves = async (req, res) => {

  try {

    const rows = await Leave.getAllLeaves();

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    console.error("❌ GET ALL LEAVES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leaves"
    });

  }

};


/**
 * UPDATE STATUS
 */
exports.updateLeaveStatus = async (req, res) => {

  try {

    const { id } = req.params;
    const { status, admin_remark } = req.body;

    await Leave.updateLeaveStatus(id, status, admin_remark);

    res.json({
      success: true,
      message: `Leave ${status}`
    });

  } catch (error) {

    console.error("❌ UPDATE LEAVE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update leave"
    });

  }

};
// controllers/leave.controller.js

/**
 * ADMIN → PENDING LEAVE COUNT (NOTIFICATION)
 */
exports.getLeaveNotificationCount = async (req, res) => {
  try {

    // 🔒 only admin allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const count = await Leave.getPendingLeaveCount();

    res.json({
      success: true,
      count
    });

  } catch (error) {

    console.error("❌ NOTIFICATION COUNT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch count"
    });

  }
};
// controller

exports.markLeavesAsSeen = async (req, res) => {
  try {

    await Leave.markAllAsSeen();

    res.json({
      success: true
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false
    });

  }
};