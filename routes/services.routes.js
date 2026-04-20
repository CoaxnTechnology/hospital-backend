const express = require("express");
const router = express.Router();
const controller = require("../controller/services.controller");
const { verifyToken, allowRoles } = require("../middlewares/auth.middleware");

// 🔥 PUBLIC
router.get("/", controller.getServices);

// 🔐 ADMIN
router.post(
  "/",
  verifyToken,
  allowRoles("admin", "doctor"),
  controller.createService,
);
router.put(
  "/:id",
  verifyToken,
  allowRoles("admin", "doctor"),
  controller.updateService,
);
router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin", "doctor"),
  controller.deleteService,
);

module.exports = router;
