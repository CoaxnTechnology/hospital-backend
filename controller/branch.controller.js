const branchModel = require("../models/branch");

/* GET ALL */
exports.getAll = async (req, res) => {
  try {
    const data = await branchModel.getAllBranches();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching branches" });
  }
};

/* GET ONE */
exports.getOne = async (req, res) => {
  try {
    const data = await branchModel.getBranchById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching branch" });
  }
};

/* CREATE */
exports.create = async (req, res) => {
  try {
    const id = await branchModel.createBranch(req.body);
    res.json({ message: "Branch created", id });
  } catch (err) {
    res.status(500).json({ message: "Error creating branch" });
  }
};

/* UPDATE */
exports.update = async (req, res) => {
  try {
    await branchModel.updateBranch(req.params.id, req.body);
    res.json({ message: "Branch updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating branch" });
  }
};

/* DELETE */
exports.delete = async (req, res) => {
  try {
    await branchModel.deleteBranch(req.params.id);
    res.json({ message: "Branch deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting branch" });
  }
};