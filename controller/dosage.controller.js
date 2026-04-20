const Dosage = require("../models/dosageForm");

exports.add = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Name required" });
    }

    await Dosage.add(name);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.getAll = async (req, res) => {
  const data = await Dosage.getAll();
  res.json({ success: true, data });
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  await Dosage.update(id, name);

  res.json({ success: true });
};

exports.delete = async (req, res) => {
  const { id } = req.params;

  await Dosage.delete(id);

  res.json({ success: true });
};