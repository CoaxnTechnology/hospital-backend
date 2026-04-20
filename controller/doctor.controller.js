const bcrypt = require("bcryptjs");
const Doctor = require("../models/doctor");
const User = require("../models/user");
const Appointment = require("../models/appointment");
const { generateResetToken } = require("../utils/token.util");
const { sendResetPasswordEmail } = require("../utils/email.util");
const { compressImage } = require("../utils/imageHelper");
/**
 * SLOT GENERATOR
 */

function generateSlots(schedule) {
  if (!schedule || schedule.length === 0) return [];

  const s = schedule[0];

  const start = s.start_time;
  const end = s.end_time;
  const duration = s.slot_duration;

  const slots = [];

  let current = new Date(`1970-01-01T${start}`);
  const endTime = new Date(`1970-01-01T${end}`);

  while (current < endTime) {
    const time = current.toTimeString().slice(0, 5);

    slots.push(time);

    current.setMinutes(current.getMinutes() + duration);
  }

  return slots;
}

/**
 * ======================
 * CREATE DOCTOR (ADMIN)
 * ======================
 */
exports.createDoctor = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      dob,
      gender,
      address,
      phone,
      department,
      biography,
    } = req.body;

    if (!first_name || !email || !department) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // ✅ LOCAL IMAGE PATH
    let imageUrl = "";

    if (req.file) {
      const filePath = req.file.path;

      const compressedFileName = await compressImage(filePath);

      imageUrl = `/uploads/doctors/${compressedFileName}`;
    }
    /**
     * CREATE USER
     */
    const userId = await User.createUserByAdmin({
      username: email,
      email,
      password: "",
      role: "doctor",
    });

    /**
     * CREATE DOCTOR PROFILE
     */
    await Doctor.addDoctor(
      userId,
      first_name,
      last_name,
      email,
      dob ? dob.split("T")[0] : null,
      gender,
      address,
      phone,
      imageUrl,
      department,
      biography,
    );

    /**
     * GENERATE RESET TOKEN
     */
    const resetToken = generateResetToken();
    await User.saveResetToken(userId, resetToken);

    /**
     * SEND EMAIL
     */
    await sendResetPasswordEmail(email, resetToken);

    return res.status(201).json({
      success: true,
      message: "Doctor created. Password reset link sent.",
    });
  } catch (error) {
    console.error("CREATE DOCTOR ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * ======================
 * GET ALL DOCTORS
 * ======================
 */

/**
 * ======================
 * GET DOCTORS (ROLE BASED)
 * ======================
 */
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.getAllDoctors();

    res.json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("GET DOCTORS ERROR:", error);

    res.status(500).json({
      success: false,
    });
  }
};
/**
 * ======================
 * GET DOCTOR BY ID
 * ======================
 */

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.getDoctorById(req.params.id);

    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("GET DOCTOR ERROR:", error);

    res.status(500).json({
      success: false,
    });
  }
};

/**
 * ======================
 * UPDATE DOCTOR
 * ======================
 */

exports.updateDoctor = async (req, res) => {
  try {
    const data = {};

    if (req.body.first_name) data.first_name = req.body.first_name;
    if (req.body.last_name) data.last_name = req.body.last_name;
    if (req.body.email) data.email = req.body.email;
    if (req.body.gender) data.gender = req.body.gender;
    if (req.body.phone) data.phone = req.body.phone;
    if (req.body.address) data.address = req.body.address;
    if (req.body.department) data.department = req.body.department;
    if (req.body.biography) data.biography = req.body.biography;

    if (req.body.dob) {
      data.dob = req.body.dob.split("T")[0];
    }

    // ✅ LOCAL IMAGE PATH
    if (req.file) {
      const filePath = req.file.path;

      const compressedFileName = await compressImage(filePath);

      data.image = `/uploads/doctors/${compressedFileName}`;
    }

    await Doctor.updateDoctor(req.params.id, data);

    res.json({
      success: true,
      message: "Doctor updated successfully",
    });
  } catch (error) {
    console.error("UPDATE DOCTOR ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

/**
 * ======================
 * DELETE DOCTOR
 * ======================
 */

exports.deleteDoctor = async (req, res) => {
  try {
    await Doctor.deleteDoctor(req.params.id);

    res.json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.error("DELETE DOCTOR ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

/**
 * ======================
 * GET DOCTOR AVAILABLE SLOTS
 * ======================
 */

exports.getDoctorSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    console.log("📡 API HIT:", id, date);

    const schedule = await Doctor.getDoctorSchedule(id, date);

    if (!schedule || schedule.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 🔥 ALL SLOTS
    const slots = generateSlots(schedule);

    // 🔥 BOOKED SLOTS FROM DB
    const booked = await Doctor.getBookedSlots(id, date);

    console.log("📌 ALL SLOTS:", slots);
    console.log("📌 RAW BOOKED:", booked);

    // 🔥 FIX: convert object → array of time
    const bookedSlots = Array.isArray(booked)
      ? booked.map((b) => b.slice(0, 5)) // 🔥 FIX
      : [];
    console.log("📌 BOOKED TIMES:", bookedSlots);

    // 🔥 FINAL FORMAT
    const finalSlots = slots.map((slot) => ({
      time: slot,
      booked: bookedSlots.includes(slot),
    }));

    console.log("🔥 FINAL SLOTS:", finalSlots);

    res.json({
      success: true,
      data: finalSlots,
    });
  } catch (error) {
    console.error("❌ GET SLOTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching slots",
    });
  }
};
exports.addDoctorSchedule = async (req, res) => {
  try {
    // 🔥 ROLE BASED DOCTOR ID
    const doctor_id =
      req.user.role === "admin"
        ? req.body.doctor_id // admin select karega
        : req.user.id; // doctor khud ka

    const { day_of_week, start_time, end_time, slot_duration } = req.body;

    console.log("🔥 ROLE:", req.user.role);
    console.log("🔥 DOCTOR ID USED:", doctor_id);

    await Doctor.addDoctorSchedule(
      doctor_id,
      day_of_week,
      start_time,
      end_time,
      slot_duration,
    );

    res.json({
      success: true,
      message: "Schedule saved",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};
exports.getDoctorSchedule = async (req, res) => {
  try {
    console.log("🔥 USER:", req.user);

    let schedule;

    // ✅ ADMIN → ALL DOCTORS
    if (req.user.role === "admin") {
      console.log("👑 ADMIN LOGIN");

      schedule = await Doctor.getAllDoctorSchedules();
    }
    // ✅ DOCTOR → ONLY OWN
    else if (req.user.role === "doctor") {
      console.log("🧑‍⚕️ DOCTOR LOGIN");

      const doctor_id = req.user.id;
      schedule = await Doctor.getDoctorFullSchedule(doctor_id);
    }
    // ✅ STAFF (optional)
    else {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("GET SCHEDULE ERROR:", error);

    res.status(500).json({
      success: false,
    });
  }
};
/**
 * ======================
 * UPLOAD SIGNATURE
 * ======================
 */
exports.uploadSignature = async (req, res) => {
  try {
    const doctor_id = req.user.id;

    let signature = null;

    if (req.file) {
      const filePath = req.file.path;

      const compressedFileName = await compressImage(filePath);

      signature = `/uploads/signatures/${compressedFileName}`;
    }

    await Doctor.updateDoctorSignature(doctor_id, signature);

    res.json({
      success: true,
      message: "Signature uploaded",
      signature,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
/**
 * ======================
 * GET SIGNATURE
 * ======================
 */
exports.getSignature = async (req, res) => {
  try {
    const doctor_id = req.user.id; // 🔥 logged-in doctor

    const data = await Doctor.getDoctorSignature(doctor_id);

    console.log("🖊 SIGNATURE DATA:", data);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ GET SIGNATURE ERROR:", error);

    res.status(500).json({
      success: false,
    });
  }
};
/**
 * ======================
 * GET DOCTORS BY DEPARTMENT
 * ======================
 */
exports.getDoctorsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;

    const data = await Doctor.getDoctorsByDepartment(department);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ GET DOCTOR BY DEPT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};
/**
 * ======================
 * PRIVATE DOCTORS (ROLE BASED - DASHBOARD)
 * ======================
 */
exports.getPrivateDoctors = async (req, res) => {
  try {
    console.log("🔥 USER:", req.user);

    let doctors = [];

    // ❌ safety
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 👑 ADMIN → ALL DOCTORS
    if (req.user.role === "admin") {
      doctors = await Doctor.getAllDoctors();
    }

    // 🧑‍⚕️ DOCTOR → ONLY OWN
    else if (req.user.role === "doctor") {
      const doctor = await Doctor.getDoctorByUserId(req.user.id);
      doctors = doctor ? [doctor] : [];
    }

    // ❌ OTHER ROLE
    else {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    return res.json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("PRIVATE DOCTORS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
