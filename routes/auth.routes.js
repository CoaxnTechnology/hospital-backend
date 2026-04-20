const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");

//router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
