const Department = require("../models/department");

/**
 * ======================
 * ADD DEPARTMENT
 * ======================
 */
exports.createDepartment = async (req, res) => {
  try {
    await Department.addDepartment({
      ...req.body,
      section: null, // 🔥 always normal department
    });

    res.json({
      success: true,
      message: "Department added successfully",
    });
  } catch (error) {
    console.error("❌ CREATE ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/**
 * ======================
 * GET ALL DEPARTMENTS
 * ======================
 */
exports.getDepartments = async (req, res) => {
  try {
    const data = await Department.getAllDepartments();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ GET ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/**
 * ======================
 * UPDATE
 * ======================
 */
exports.updateDepartment = async (req, res) => {
  try {
    await Department.updateDepartment(req.params.id, {
      ...req.body,
      section: null,
    });

    res.json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/**
 * ======================
 * DELETE
 * ======================
 */
exports.deleteDepartment = async (req, res) => {
  try {
    await Department.deleteDepartment(req.params.id);

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("❌ DELETE ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/**
 * ======================
 * 🔥 SECTION APIs
 * ======================
 */
exports.getSection = async (req, res) => {
  const data = await Department.getSection(req.params.key);
  res.json(data);
};

exports.saveSection = async (req, res) => {
  await Department.saveSection(req.params.key, req.body);
  res.json({ success: true });
};

exports.deleteSection = async (req, res) => {
  await Department.deleteSection(req.params.key);
  res.json({ success: true });
};

/**
 * ======================
 * 🔥 HOME API
 * ======================
 */
exports.getHome = async (req, res) => {
  try {
    const data = await Department.getHomeData();

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("❌ HOME ERROR:", error);
    res.status(500).json({ success: false });
  }
};
/**
 * ======================
 * GET SINGLE DEPARTMENT
 * ======================
 */
exports.getDepartment = async (req, res) => {
  try {
    const data = await Department.getDepartmentById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ GET SINGLE ERROR:", error);
    res.status(500).json({ success: false });
  }
};