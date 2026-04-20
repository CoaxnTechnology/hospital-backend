const Supplier = require("../models/supplier");

exports.add = async (req, res) => {
  try {
    await Supplier.add(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.getAll = async (req, res) => {
  const data = await Supplier.getAll();
  res.json({ success: true, data });
};

exports.update = async (req, res) => {
  const { id } = req.params;
  await Supplier.update(id, req.body);
  res.json({ success: true });
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  await Supplier.delete(id);
  res.json({ success: true });
};