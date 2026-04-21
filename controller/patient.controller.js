const Patient = require("../models/patient");

/* ======================
   GET ALL PATIENTS
====================== */
exports.getPatients = async (req, res) => {
  try {
    console.log("📡 GET /api/patients called");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const doctorName = req.query.doctor || "";

    const offset = (page - 1) * limit;

    const userId = req.user.id;
    const role = req.user.role;

    console.log("👤 USER:", { userId, role });
    console.log("🔍 QUERY:", {
      page,
      limit,
      search,
      doctorName,
      offset,
    });

    const { data, total } = await Patient.getAllPatientsPaginated(
      limit,
      offset,
      search,
      role,
      userId,
      doctorName,
    );

    console.log("📊 RESULT:", {
      total,
      returned: data.length,
    });

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Controller getPatients error:", error);

    res.status(500).json({
      success: false,
      message: "Database error",
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
        message: "Patient not found",
      });
    }

    console.log("✅ Patient profile:", patient);

    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error("❌ Controller getPatient error:", error);

    res.status(500).json({
      success: false,
      message: "Database error",
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
      data: history,
    });
  } catch (error) {
    console.error("❌ Controller patientHistory error:", error);

    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};
