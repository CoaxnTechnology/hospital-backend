const router = require("express").Router();
const ctrl = require("../controller/hospital.controller");

const multer = require("multer");
const path = require("path");

/**
 * ======================
 * LOCAL STORAGE (LOGO)
 * ======================
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/hospital"); // 📁 local folder
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage }).single("logo");

/**
 * ======================
 * ROUTES
 * ======================
 */
router.get("/hospital", ctrl.get);

router.post(
  "/hospital",
  (req, res, next) => {
    console.log("📥 Incoming request");

    upload(req, res, function (err) {
      if (err) {
        console.error("❌ MULTER ERROR:", err);
        return res.status(500).json({ error: err.message });
      }

      console.log("✅ File uploaded:", req.file);
      console.log("📦 Body:", req.body);

      next();
    });
  },
  ctrl.save
);

module.exports = router;