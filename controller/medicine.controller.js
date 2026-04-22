const Medicine = require("../models/medicine");
const XLSX = require("xlsx");
const fs = require("fs");
/**
 * ======================
 * CREATE MEDICINE
 * ======================
 */
exports.createMedicine = async (req, res) => {
  try {
    console.log("Incoming body:", req.body);

    await Medicine.addMedicine(req.body);

    res.json({
      success: true,
      message: "Medicine added successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

/**
 * ======================
 * GET ALL MEDICINES
 * ======================
 */
exports.getAllMedicine = async (req, res) => {
  try {
    const medicines = await Medicine.getAllMedicine();

    res.json({
      success: true,
      data: medicines,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch medicines",
    });
  }
};

/**
 * ======================
 * GET MEDICINE BY ID
 * ======================
 */
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.getMedicineById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.json({
      success: true,
      data: medicine,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch medicine",
    });
  }
};

/**
 * ======================
 * UPDATE MEDICINE
 * ======================
 */
exports.updateMedicine = async (req, res) => {
  try {
    await Medicine.updateMedicine(req.params.id, req.body);

    res.json({
      success: true,
      message: "Medicine updated successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

/**
 * ======================
 * DELETE MEDICINE
 * ======================
 */
exports.deleteMedicine = async (req, res) => {
  try {
    await Medicine.deleteMedicine(req.params.id);

    res.json({
      success: true,
      message: "Medicine deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

/**
 * ======================
 * SEARCH MEDICINE
 * ======================
 */
exports.searchMedicine = async (req, res) => {
  try {
    const medicines = await Medicine.searchMedicine(req.query.key);

    res.json({
      success: true,
      data: medicines,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};

/**
 * ======================
 * SELL MEDICINE
 * ======================
 */
exports.sellMedicine = async (req, res) => {
  try {
    const { id, quantity } = req.body;

    if (!id || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Medicine id and quantity required",
      });
    }

    await Medicine.sellMedicine(id, quantity);

    res.json({
      success: true,
      message: "Medicine sold successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Sell operation failed",
    });
  }
};

/**
 * ======================
 * RETURN MEDICINE
 * ======================
 */
exports.returnMedicine = async (req, res) => {
  try {
    console.log("Return Request Body:", req.body);

    const items = req.body;

    let totalRefund = 0;
    const refundDetails = [];

    for (const item of items) {
      const { medicine_id, quantity } = item;

      if (!medicine_id || !quantity) {
        return res.status(400).json({
          success: false,
          message: "medicine_id and quantity required",
        });
      }

      // 1️⃣ Medicine price fetch
      const medicine = await Medicine.getMedicineById(medicine_id);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: "Medicine not found",
        });
      }

      const price = Number(medicine.selling_price);

      // 2️⃣ Refund calculation
      const subtotal = price * quantity;

      const gst = subtotal * 0.05; // 5% GST

      const refundAmount = subtotal + gst;

      // 3️⃣ Save return + stock update
      await Medicine.returnMedicine({
        medicine_id,
        quantity,
        price,
        gst,
        refund_amount: refundAmount,
      });

      totalRefund += refundAmount;

      refundDetails.push({
        medicine_id,
        name: medicine.name,
        quantity,
        price,
        gst,
        refundAmount,
      });
    }

    res.json({
      success: true,
      totalRefund,
      refundDetails,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Return operation failed",
    });
  }
};
/**
 * ======================
 * LOW STOCK
 * ======================
 */
exports.getLowStock = async (req, res) => {
  try {
    const medicines = await Medicine.getLowStock(10);

    res.json({
      success: true,
      data: medicines,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};

/**
 * ======================
 * EXPIRING SOON
 * ======================
 */
exports.getExpiringSoon = async (req, res) => {
  try {
    const medicines = await Medicine.getExpiringSoon(30);

    res.json({
      success: true,
      data: medicines,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};

/**
 * ======================
 * TOTAL STOCK VALUE
 * ======================
 */
exports.getStockValue = async (req, res) => {
  try {
    const value = await Medicine.getStockValue();

    res.json({
      success: true,
      totalStockValue: value.totalStockValue,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};

/**
 * ======================
 * UPLOAD EXCEL
 * ======================
 */

// 🔥 EXCEL DATE FIX

const db = require("../config/db");
// 🔥 DATE FIX FUNCTION
const formatExcelDate = (excelDate) => {
  if (!excelDate) return null;

  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split("T")[0];
};

exports.uploadExcel = async (req, res) => {
  try {
    console.log("📥 Upload API hit");

    if (!req.file) {
      console.log("❌ No file received");
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    console.log("📁 File received:", req.file);

    const filePath = req.file.path;

    // 🔥 READ EXCEL
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);

    console.log("📦 Raw data:", data);

    if (!data.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      });
    }

    // 🔥 GET EXISTING BRANDS
    const [brands] = await db.query("SELECT id, name FROM medicine_brand");
    console.log("🏷 Existing brands:", brands);

    const values = [];

    // 🔥 LOOP DATA
    for (let row of data) {
      console.log("👉 Processing:", row.name);

      // 🔥 FIND BRAND
      let brand = brands.find(
        (b) => b.name.toLowerCase() === row.brand_name?.toLowerCase()
      );

      let brandId;

      // 🔥 CREATE BRAND IF NOT EXISTS
      if (!brand) {
        console.log(`➕ Creating brand: ${row.brand_name}`);

        const [result] = await db.query(
          "INSERT INTO medicine_brand (name) VALUES (?)",
          [row.brand_name]
        );

        brandId = result.insertId;

        // 🔥 ADD IN LOCAL ARRAY (IMPORTANT)
        brands.push({
          id: brandId,
          name: row.brand_name,
        });

      } else {
        brandId = brand.id;
      }

      // 🔥 PUSH VALUES
      values.push([
        row.name || "",
        row.generic_name || "",
        brandId,
        row.category || "",
        row.dosage_form || "",
        row.strength || "",
        row.manufacturer || "",
        row.supplier || "",
        Number(row.quantity) || 0,
        Number(row.reorder_level) || 10,
        row.unit || "Units",
        Number(row.unit_cost) || 0,
        Number(row.selling_price) || 0,
        Number(row.gst_percentage) || 0, // 👈 ADD THIS
        row.shelf_location || "",
        row.batch_number || "",
        formatExcelDate(row.manufacturing_date),
        formatExcelDate(row.expiry_date),
        row.barcode || "",
        row.prescription_required === true ||
        row.prescription_required === "true" ||
        row.prescription_required === 1,
        row.description || "",
        row.composition || "",
        row.storage || "",
      ]);
    }

    console.log("✅ Final values ready:", values.length);

    // 🔥 INSERT INTO DB
    await Medicine.bulkInsertMedicines(values);

    console.log("✅ Inserted into DB:", values.length);

    // 🔥 DELETE FILE
    try {
      fs.unlinkSync(filePath);
      console.log("🗑 File deleted");
    } catch (err) {
      console.log("⚠️ File delete failed:", err.message);
    }

    res.json({
      success: true,
      message: "Excel uploaded successfully",
      totalInserted: values.length,
    });

  } catch (error) {
    console.error("❌ Upload Error:", error);

    res.status(500).json({
      success: false,
      message: "Error processing Excel file",
      error: error.message,
    });
  }
};
