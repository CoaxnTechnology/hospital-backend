const Hospital = require("../models/hospital");
const fs = require("fs");
/* ======================
   GET
====================== */
exports.get = async (req, res) => {
  try {
    const data = await Hospital.get();

    res.json({
      success: true,
      data: data || null,
    });
  } catch (err) {
    console.error("❌ GET hospital error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch hospital",
    });
  }
};

/* ======================
   SAVE
====================== */
exports.save = async (req, res) => {
  try {
    const existing = (await Hospital.get()) || {};

    let logoPath = existing.logo || null;

    // 🔥 COMPRESS IMAGE IF UPLOADED
    if (req.file) {
      const filePath = req.file.path;

      const sizeKB = fs.statSync(filePath).size / 1024;
      console.log("📦 Uploaded Size:", sizeKB.toFixed(2), "KB");
      // ✅ DIRECT SAVE (NO COMPRESSION)
      logoPath = `/uploads/hospital/${req.file.filename}`;
    }

    const data = {
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      instagram: req.body.instagram || existing.instagram || null,
      facebook: req.body.facebook || existing.facebook || null,
      logo: logoPath,
    };

    await Hospital.save(data);

    res.json({
      success: true,
      logo: logoPath,
    });
  } catch (err) {
    console.error("❌ SAVE hospital error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to save hospital",
    });
  }
};
