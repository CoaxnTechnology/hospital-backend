const Hero = require("../models/hero");
const { compressImage } = require("../utils/imageHelper");
/**
 * CREATE
 */
exports.createHero = async (req, res) => {
  try {
    let image = null;

    if (req.file) {
      const filePath = req.file.path;
      const compressedFileName = await compressImage(filePath);
      image = `/uploads/hero/${compressedFileName}`;
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
    console.error(err);
    res.status(500).json({ message: "Error creating hero" });
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

 let image = existing?.image;

    if (req.file) {
      const filePath = req.file.path;
      const compressedFileName = await compressImage(filePath);
      image = `/uploads/hero/${compressedFileName}`;
    }

    await Hero.updateHero(id, {
      title: req.body.title,
      highlight: req.body.highlight,
      description: req.body.description,
      image,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error updating hero" });
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