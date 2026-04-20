const Brand = require("../models/medicineBrand");

/**
 * ADD
 */
exports.addBrand = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Name required" });
    }

    await Brand.addBrand(name);

    res.json({ success: true, message: "Brand added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

/**
 * GET
 */
exports.getBrands = async (req, res) => {
  try {
    const data = await Brand.getBrands();

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

/**
 * UPDATE
 */
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    await Brand.updateBrand(id, name);

    res.json({
      success: true,
      message: "Brand updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

/**
 * DELETE
 */
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    await Brand.deleteBrand(id);

    res.json({
      success: true,
      message: "Brand deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};