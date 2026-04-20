const express = require("express");
const router = express.Router();
const heroController = require("../controller/hero.controller");

const multer = require("multer");
const path = require("path");

/**
 * STORAGE
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/hero");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/**
 * ROUTES
 */
router.post("/", upload.single("image"), heroController.createHero);
router.get("/", heroController.getHero);
router.put("/:id", upload.single("image"), heroController.updateHero);
router.delete("/:id", heroController.deleteHero);

module.exports = router;