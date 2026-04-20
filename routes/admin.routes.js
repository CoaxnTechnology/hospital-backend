const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin.controller");
const {
  verifyToken,
  allowRoles,
} = require("../middlewares/auth.middleware");

router.post(
  "/employees",
  verifyToken,
  allowRoles("admin"),
  adminController.createEmployee
);

module.exports = router;
