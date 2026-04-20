const Patient = require("../models/patient");

/* ======================
   GET ALL PATIENTS
====================== */
exports.getPatients = async (req, res) => {

  try {

    console.log("📡 GET /api/patients called");

    const patients = await Patient.getAllPatients();

    console.log("✅ Controller getPatients success");

    res.json({
      success: true,
      data: patients
    });

  } catch (error) {

    console.error("❌ Controller getPatients error:", error);

    res.status(500).json({
      success: false,
      message: "Database error"
    });

  }

};


/* ======================
   GET PATIENT BY ID
====================== */
exports.getPatient = async (req, res) => {

  try {

    console.log("📡 GET /api/patients/:id", req.params.id);

    const patient = await Patient.getPatientById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    console.log("✅ Patient profile:", patient);

    res.json({
      success: true,
      data: patient
    });

  } catch (error) {

    console.error("❌ Controller getPatient error:", error);

    res.status(500).json({
      success: false,
      message: "Database error"
    });

  }

};


/* ======================
   PATIENT HISTORY
====================== */
exports.patientHistory = async (req, res) => {

  try {

    console.log("📡 GET /api/patients/:id/history", req.params.id);

    const history = await Patient.getPatientHistory(req.params.id);

    console.log("✅ Patient history rows:", history);

    res.json({
      success: true,
      data: history
    });

  } catch (error) {

    console.error("❌ Controller patientHistory error:", error);

    res.status(500).json({
      success: false,
      message: "Database error"
    });

  }

};