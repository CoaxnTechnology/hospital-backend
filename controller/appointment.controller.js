const Appointment = require("../models/appointment");

/**
 * CREATE APPOINTMENT
 */
/**
 * CREATE APPOINTMENT
 */
/**
 * ======================
 * CREATE APPOINTMENT
 * ======================
 */
exports.createAppointment = async (req, res) => {
  try {
    // 🔥 1. FIREBASE VERIFY CHECK (ADD THIS)
    const firebaseUser = req.firebaseUser;
    console.log("📲 Firebase User:", firebaseUser);
    if (!firebaseUser || !firebaseUser.phone_number) {
      console.log(
        "⚠️ Firebase verification failed or phone number missing:",
        firebaseUser,
      );
      return res.status(400).json({
        success: false,
        message: "Phone not verified",
      });
    }
    console.log("✅ Firebase verified phone:", firebaseUser.phone_number);

    const {
      patient_id,
      patient_name,
      phone,
      age, // 🔥 ADD THIS
      gender, // 🔥 ADD THIS
      department,
      doctor_id,
      date,
      time,
      problem,
    } = req.body;

    console.log("📥 REQUEST BODY:", req.body);
    console.log("🔎 Validation values:", {
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
    });

    // 🔥 PHONE MATCH CHECK
    const expectedPhone = phone ? "+91" + phone : null;
    console.log("📞 Frontend Phone:", phone);
    console.log("📞 Expected Firebase Phone:", expectedPhone);
    console.log("📞 Firebase Phone:", firebaseUser.phone_number);

    if (phone && firebaseUser.phone_number !== expectedPhone) {
      console.log("❌ Phone mismatch detected", {
        frontendPhone: phone,
        expectedPhone,
        firebasePhone: firebaseUser.phone_number,
      });
      return res.status(400).json({
        success: false,
        message: "Phone number mismatch",
      });
    }
    console.log("✅ Phone matched");

    /**
     * ======================
     * VALIDATION
     * ======================
     */
    if (!doctor_id || !date || !time) {
      console.log("⚠️ Validation failed: missing doctor, date, or time", {
        doctor_id,
        date,
        time,
      });
      return res.status(400).json({
        success: false,
        message: "Doctor, date and time are required",
      });
    }

    // If no patient_id → need name + phone
    if (!patient_id && (!patient_name || !phone)) {
      console.log("⚠️ Validation failed: missing patient details", {
        patient_id,
        patient_name,
        phone,
      });
      return res.status(400).json({
        success: false,
        message: "Patient details required",
      });
    }

    /**
     * ======================
     * CALL SERVICE / MODEL
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
    console.log("🧾 Appointment payload to model:", appointmentPayload);

    const result = await Appointment.addAppointment(appointmentPayload);
    console.log("✅ Appointment created result:", result);

    /**
     * ======================
     * SUCCESS RESPONSE
     * ======================
     */
    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: {
        appointment_id: result.appointment_id,
        token: result.token,
      },
    });
  } catch (error) {
    console.error("❌ CONTROLLER ERROR:", error);

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
    const { doctor_id, date } = req.body;

    await Appointment.nextPatient(doctor_id, date);

    res.json({
      success: true,
      message: "Next patient called",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
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
