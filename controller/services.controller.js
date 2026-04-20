const Service = require("../models/services");

/**
 * CREATE
 */
exports.createService = async (req, res) => {
  try {
    await Service.addService(req.body);

    res.json({
      success: true,
      message: "Service added",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

/**
 * GET ALL (PUBLIC)
 */
exports.getServices = async (req, res) => {
  try {
    const data = await Service.getAllServices();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/**
 * UPDATE
 */
exports.updateService = async (req, res) => {
  try {
    await Service.updateService(req.params.id, req.body);

    res.json({
      success: true,
      message: "Updated",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/**
 * DELETE
 */
exports.deleteService = async (req, res) => {
  try {
    await Service.deleteService(req.params.id);

    res.json({
      success: true,
      message: "Deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};