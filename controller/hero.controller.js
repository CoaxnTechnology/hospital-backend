const Hero = require("../models/hero");
/**
 * CREATE
 */
exports.createHero = async (req, res) => {
  try {
    let image = null;

    // 🔥 FRONTEND ALREADY COMPRESSED → JUST SAVE
    if (req.file) {
      image = `/uploads/hero/${req.file.filename}`;

      console.log("📦 Uploaded file:", req.file.filename);
    }

    const id = await Hero.addHero({
      title: req.body.title,
      highlight: req.body.highlight,
      description: req.body.description,
      image,
    });

    res.json({
      success: true,
      id,
      image,
    });
  } catch (err) {
    console.error("❌ CREATE HERO ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Error creating hero",
    });
  }
};
/**
 * GET ALL
 */
exports.getHero = async (req, res) => {
  try {
    const data = await Hero.getAllHero();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching hero" });
  }
};

/**
 * UPDATE
 */
exports.updateHero = async (req, res) => {
  try {
    const id = req.params.id;

    const existing = await Hero.getHeroById(id);

    // 🔥 Default: पुरानी image
    let image = existing?.image || null;

    // 🔥 अगर नई file आई है → replace
    if (req.file) {
      image = `/uploads/hero/${req.file.filename}`;
      console.log("📦 New image uploaded:", req.file.filename);
    }

    await Hero.updateHero(id, {
      title: req.body.title,
      highlight: req.body.highlight,
      description: req.body.description,
      image,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ UPDATE HERO ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Error updating hero",
    });
  }
};
/**
 * DELETE
 */
exports.deleteHero = async (req, res) => {
  try {
    await Hero.deleteHero(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error deleting hero" });
  }
};
