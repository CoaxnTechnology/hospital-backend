const Category = require("../models/category");

exports.add = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.json({ success: false });

    await Category.add(name);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};

exports.getAll = async (req, res) => {
  const data = await Category.getAll();
  res.json({ success: true, data });
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  await Category.update(id, name);
  res.json({ success: true });
};

exports.delete = async (req, res) => {
  const { id } = req.params;

  await Category.delete(id);
  res.json({ success: true });
};