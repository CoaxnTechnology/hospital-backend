const Prescription = require("../models/prescription");
const generatePDF = require("../utils/generatePrescriptionPDF");
const con = require("../config/db");
const generateHTML = require("../utils/prescriptionTemplate");
const fs = require("fs");
/**
 * CREATE PRESCRIPTION
 */

/**
 * CREATE PRESCRIPTION
 */
exports.createPrescription = async (req, res) => {
  try {
    const { appointment_id, doctor_id, patient_id, medicines } = req.body;

    if (!appointment_id || !doctor_id || !patient_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    /**
     * 1️⃣ Create prescription
     */
    const prescriptionId = await Prescription.createPrescription({
      appointment_id,
      doctor_id,
      patient_id,
    });

    /**
     * 2️⃣ Insert medicines
     */
    if (medicines && medicines.length > 0) {
      await Prescription.addMedicines(prescriptionId, medicines);
    }

    /**
     * 3️⃣ Get patient + doctor data (🔥 UPDATED)
     */
    const [rows] = await con.query(
      `
      SELECT 
        p.id,
        p.name as patient_name,
        p.age,
        p.phone as mobile,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
        d.department,
        d.signature   -- ✅ ADDED
      FROM patient p
      JOIN doctor d ON d.id = ?
      WHERE p.id = ?
      `,
      [doctor_id, patient_id],
    );

    const patientData = rows[0] || {};

    /**
     * 4️⃣ Get hospital data
     */
    const [hospitalRows] = await con.query(
      `SELECT name, address, logo FROM hospital LIMIT 1`,
    );

    const hospitalData = hospitalRows[0] || {};

    /**
     * 5️⃣ Generate HTML (🔥 UPDATED)
     */
    const BASE_URL = "https://hospital.clinicalgynecologists.space";

    const htmlContent = generateHTML({
      hospital: {
        name: hospitalData?.name || "Hospital",
        address: hospitalData?.address || "",
        logo: hospitalData?.logo
          ? `${BASE_URL}${hospitalData.logo}` // ✅ FIXED
          : "",
      },
      patient: {
        id: patientData?.id || "N/A",
        name: patientData?.patient_name || "N/A",
        age: patientData?.age || "-",
        mobile: patientData?.mobile || "-",
      },
      doctor: {
        name: patientData?.doctor_name || "N/A",
        department: patientData?.department || "General",
        signature: patientData?.signature || "", // ✅ ADDED
      },
      medicines: medicines || [],
      date: new Date().toLocaleDateString(),
    });

    /**
     * 6️⃣ Generate PDF
     */
    const path = require("path");

    const fileName = `prescription_${prescriptionId}.pdf`;
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      "prescriptions",
      fileName,
    );

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await generatePDF({
      htmlContent,
      filePath,
    });

    /**
     * 7️⃣ Save path in DB
     */
    const dbPath = `/uploads/prescriptions/${fileName}`;
    await Prescription.updatePdfPath(prescriptionId, dbPath);

    /**
     * 8️⃣ Update appointment status
     */
    await Prescription.updateAppointmentStatus(appointment_id);

    /**
     * 9️⃣ Response
     */
    return res.json({
      success: true,
      message: "Prescription created successfully",
      prescriptionId,
      pdf: dbPath,
    });
  } catch (error) {
    console.error("❌ CREATE PRESCRIPTION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
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
