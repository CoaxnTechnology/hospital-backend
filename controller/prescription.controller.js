const Prescription = require("../models/prescription");
const con = require("../config/db");
const fs = require("fs");
/**
 * CREATE PRESCRIPTION
 */

/**
 * CREATE PRESCRIPTION
 */
exports.createPrescription = async (req, res) => {
  try {
    console.log("📥 INCOMING REQUEST BODY:", req.body);

    const { appointment_id, doctor_id, patient_id, medicines } = req.body;

    const prescriptionId = await Prescription.createPrescription({
      appointment_id,
      doctor_id,
      patient_id,
    });

    console.log("✅ PRESCRIPTION CREATED ID:", prescriptionId);

    /**
     * 🔥 CHECK DB RIGHT AFTER INSERT
     */
    const [check] = await con.query("SELECT * FROM prescription WHERE id = ?", [
      prescriptionId,
    ]);

    console.log("🧾 DB RECORD AFTER CREATE:", check[0]);

    if (medicines && medicines.length > 0) {
      await Prescription.addMedicines(prescriptionId, medicines);
    }

    await Prescription.updateAppointmentStatus(appointment_id);

    return res.json({
      success: true,
      prescriptionId,
    });
  } catch (error) {
    console.error("❌ CREATE PRESCRIPTION ERROR:", error);
  }
};
/**
 * ======================
 * GET PRESCRIPTION BY APPOINTMENT
 * ======================
 */
exports.getPrescription = async (req, res) => {
  try {
    const id = req.params.appointment_id; // 👈 rename

    console.log("ID RECEIVED:", id); // 🔥 DEBUG

    const data = await Prescription.getFullPrescription(id);

    console.log("DATA FROM DB:", data); // 🔥 DEBUG

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ GET PRESCRIPTION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * ======================
 * GET PRESCRIPTION MEDICINES
 * ======================
 */
exports.getPrescriptionMedicines = async (req, res) => {
  try {
    const prescriptionId = req.params.id;

    const [rows] = await con.query(
      `
      SELECT 
      pm.medicine_name,
      pm.dosage,
      pm.duration,
      pm.instructions,
      m.id as medicine_id,
      m.selling_price,
      m.quantity,
      m.expiry_date,
      m.batch_number
      FROM prescription_medicine pm
      LEFT JOIN medicine m
      ON LOWER(m.name) = LOWER(pm.medicine_name)
      WHERE pm.prescription_id = ?
      `,
      [prescriptionId],
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load medicines",
    });
  }
};

/**
 * ======================
 * GET PRESCRIPTION BY ID (for pharmacy)
 * ======================
 */
exports.getPrescriptionById = async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await con.query(
      `
      SELECT 
      p.id,
      p.patient_id,
      p.doctor_id,
      pt.name as patient_name
      FROM prescription p
      LEFT JOIN patient pt ON pt.id = p.patient_id
      WHERE p.id = ?
      `,
      [id],
    );

    if (!rows.length) {
      return res.json({
        success: true,
        data: null,
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("❌ GET PRESCRIPTION BY ID ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * ======================
 * GET PRESCRIPTION PDF
 * ======================
 */
exports.getPrescriptionPDF = async (req, res) => {
  try {
    const id = req.params.id;

    const path = require("path");
    const fs = require("fs");

    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      "prescriptions",
      `prescription_${id}.pdf`,
    );

    console.log("📄 PDF PATH:", filePath);

    // ✅ check file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "PDF not found",
      });
    }

    // ✅ send file
    res.sendFile(filePath);
  } catch (error) {
    console.error("❌ GET PDF ERROR:", error);
    res.status(500).send("Error loading PDF");
  }
};
