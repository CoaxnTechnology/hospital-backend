const Appointment = require("../models/appointment");
const db = require("../config/db");
/**
 * CREATE APPOINTMENT
 */
exports.createAppointment = async (req, res) => {
  try {
    const firebaseUser = req.firebaseUser;
    console.log("📲 Firebase User:", firebaseUser);

    // 🔥 OTP CHECK
    if (!firebaseUser || !firebaseUser.phone_number) {
      return res.status(400).json({
        success: false,
        message: "Phone not verified",
      });
    }

    const {
      patient_id,
      patient_name,
      phone,
      age,
      gender,
      department,
      doctor_id,
      date,
      time,
      problem,
    } = req.body;

    console.log("📥 REQUEST BODY:", req.body);

    // 🔥 FRONTEND PHONE FORMAT
    const expectedPhone = phone ? "+91" + phone : null;

    console.log("📞 Expected:", expectedPhone);
    console.log("📞 Firebase:", firebaseUser.phone_number);

    // 🔥 PHONE MATCH CHECK (IMPORTANT)
    if (phone && firebaseUser.phone_number !== expectedPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number mismatch",
      });
    }

    /**
     * ======================
     * CASE 1: ID GIVEN
     * ======================
     */
    if (patient_id) {
      console.log("📌 ID CASE");

      const [rows] = await db.query("SELECT phone FROM patient WHERE id=?", [
        patient_id,
      ]);

      if (!rows.length) {
        return res.status(400).json({
          success: false,
          message: "Invalid patient ID",
        });
      }

      const patientPhone = "+91" + rows[0].phone;

      console.log("📞 DB Phone:", patientPhone);

      // 🔥 FINAL SECURITY CHECK
      if (firebaseUser.phone_number !== patientPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone does not match patient ID",
        });
      }

      console.log("✅ ID + Phone verified");
    }

    /**
     * ======================
     * VALIDATION
     * ======================
     */
    if (!doctor_id || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date and time required",
      });
    }

    if (!patient_id && (!patient_name || !phone)) {
      return res.status(400).json({
        success: false,
        message: "Patient details required",
      });
    }

    /**
     * ========================
     * CALL MODEL
     * ======================
     */
    const appointmentPayload = {
      patient_id,
      patient_name,
      phone,
      age,
      gender,
      department,
      doctor_id,
      date,
      time,
      problem,
    };

    console.log("📦 FINAL PAYLOAD:", appointmentPayload);

    const result = await Appointment.addAppointment(appointmentPayload);

    console.log("✅ SUCCESS:", result);

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: {
        appointment_id: result.appointment_id,
        token: result.token,
      },
    });
  } catch (error) {
    console.error("❌ ERROR:", error);

    if (
      error.message === "Slot already booked" ||
      error.message === "Patient details required" ||
      error.message === "Invalid patient ID"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
/**
 * GET ALL APPOINTMENTS
 */
exports.getAppointments = async (req, res) => {
  try {
    const { filter, date } = req.query;

    const rows = await Appointment.getAllAppointments(filter, date);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("❌ DB ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

/**
 * GET SINGLE APPOINTMENT
 */
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.getAppointmentById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("❌ DB ERROR (GET ONE):", error);

    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

/**
 * SEND TO CONSULTANT
 */
exports.sendToConsultant = async (req, res) => {
  try {
    await Appointment.updateStatus(req.params.id, "In Consultation");

    res.json({
      success: true,
      message: "Appointment sent to consultant",
    });
  } catch (error) {
    console.error("❌ DB ERROR (SEND TO CONSULTANT):", error);

    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

/**
 * COMPLETE CONSULTATION
 * (Auto next patient)
 */
exports.completeConsultation = async (req, res) => {
  try {
    const { id, doctor_id, date } = req.body;

    await Appointment.completeConsultation(id, doctor_id, date);

    res.json({
      success: true,
      message: "Consultation completed and next patient called",
    });
  } catch (error) {
    console.error("❌ DB ERROR (COMPLETE):", error);

    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

/**
 * UPDATE APPOINTMENT
 */
exports.updateAppointment = async (req, res) => {
  try {
    await Appointment.updateAppointment(req.params.id, req.body);

    res.json({
      success: true,
      message: "Appointment updated successfully",
    });
  } catch (error) {
    console.error("❌ DB ERROR (UPDATE):", error);

    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

/**
 * DELETE APPOINTMENT
 */
exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.deleteAppointment(req.params.id);

    res.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("❌ DB ERROR (DELETE):", error);

    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

/**
 * DOCTOR DASHBOARD
 */
exports.getMyAppointments = async (req, res) => {
  try {
    const doctor_id = req.user.id;

    const rows = await Appointment.getDoctorAppointments(doctor_id);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("❌ DB ERROR (DOCTOR DASHBOARD):", error);

    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

/**
 * GET DOCTOR QUEUE
 */
exports.getDoctorQueue = async (req, res) => {
  try {
    const { doctor_id, date } = req.query;

    const queue = await Appointment.getDoctorQueue(doctor_id, date);

    res.json({
      success: true,
      data: queue,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};

/**
 * NEXT PATIENT
 */
exports.nextPatient = async (req, res) => {
  try {
    console.log("➡️ CONTROLLER: NEXT PATIENT HIT");

    const { doctor_id } = req.body;

    console.log("📥 RAW BODY:", req.body);
    console.log("📥 doctor_id:", doctor_id, typeof doctor_id);

    if (!doctor_id) {
      console.log("❌ Missing doctor_id");
      return res.status(400).json({
        success: false,
        message: "doctor_id required",
      });
    }

    await Appointment.nextPatient(doctor_id);

    console.log("✅ CONTROLLER SUCCESS");

    res.json({
      success: true,
      message: "Next patient called",
    });
  } catch (error) {
    console.error("❌ CONTROLLER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.skipPatient = async (req, res) => {
  try {
    const { id, doctor_id, date } = req.body;

    await Appointment.skipPatient({
      id,
      doctor_id,
      date,
    });

    res.json({
      success: true,
      message: "Patient skipped",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
exports.recallPatient = async (req, res) => {
  try {
    const { id } = req.body;

    await Appointment.recallPatient(id);

    res.json({
      success: true,
      message: "Patient recalled",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};
exports.getAppointmentsPaginated = async (req, res) => {
  try {
    console.log("📡 GET /api/appointments (paginated)");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.filter || "today";
    const customDate = req.query.date || null;
    const search = req.query.search || ""; // 👈 ADD THIS

    console.log("🔍 QUERY:", { page, limit, filter, customDate, search });

    const { data, total } = await Appointment.getAppointmentsPaginated(
      page,
      limit,
      filter,
      customDate,
      search, // 👈 PASS HERE
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
    console.error("❌ Controller getAppointmentsPaginated error:", error);

    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};
