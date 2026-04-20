const db = require("../config/db");

/**
 * ======================
 * ADD DOCTOR
 * ======================
 */
exports.addDoctor = async (
  user_id,
  first_name,
  last_name,
  email,
  dob,
  gender,
  address,
  phone,
  image,
  department,
  biography,
) => {
  const sql = `
  INSERT INTO doctor
  (user_id, first_name, last_name, email, dob, gender, address, phone, image, department, biography)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    user_id,
    first_name,
    last_name,
    email,
    dob,
    gender,
    address,
    phone,
    image,
    department,
    biography,
  ]);

  return result.insertId;
};

/**
 * ======================
 * GET ALL DOCTORS
 * ======================
 */
exports.getAllDoctors = async () => {
  const sql = `
  SELECT *
  FROM doctor
  ORDER BY id DESC
  `;

  const [rows] = await db.query(sql);

  return rows;
};

/**
 * ======================
 * GET DOCTOR BY ID
 * ======================
 */
exports.getDoctorById = async (id) => {
  const sql = `
  SELECT *
  FROM doctor
  WHERE id = ?
  `;

  const [rows] = await db.query(sql, [id]);

  console.log("🟢 RAW DB DOB:", rows?.[0]?.dob);

  return rows[0];
};

/**
 * ======================
 * UPDATE DOCTOR
 * ======================
 */
exports.updateDoctor = async (id, data) => {
  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(id);

  const sql = `
  UPDATE doctor
  SET ${fields.join(", ")}
  WHERE id = ?
  `;

  const [result] = await db.query(sql, values);

  return result;
};

/**
 * ======================
 * DELETE DOCTOR
 * ======================
 */
exports.deleteDoctor = async (id) => {
  const sql = `
  DELETE FROM doctor
  WHERE id = ?
  `;

  const [result] = await db.query(sql, [id]);

  return result;
};

/**
 * ======================
 * GET DOCTOR APPOINTMENTS
 * ======================
 */
exports.getDoctorAppointments = async (doctor_id) => {
  console.log("🔥 API HIT getDoctorAppointments:", doctor_id);

  const sql = `
  SELECT
    a.id,
    a.token_number,
    a.date,
    a.time,
    a.status,
    a.department,
    p.name AS patient_name,
    p.phone AS patient_phone,
    p.age,
    p.gender,
    pr.id AS prescription_id
  FROM appointment a
  JOIN patient p ON p.id = a.patient_id
  LEFT JOIN prescription pr 
  ON pr.id = (
    SELECT id FROM prescription 
    WHERE appointment_id = a.id 
    ORDER BY id DESC 
    LIMIT 1
  )
  WHERE a.doctor_id = ?
  AND DATE(a.date) = CURDATE()
  AND a.status IN (
    'Pending',              -- 🔥 MUST
    'In Consultation',
    'Prescription Added',
    'Skipped'
  )
  ORDER BY a.token_number ASC
  `;

  console.log("📡 SQL:", sql);

  const [rows] = await db.query(sql, [doctor_id]);

  console.log("📥 RESULT:", rows);

  return rows;
};

/**
 * ======================
 * ADD DOCTOR SCHEDULE
 * ======================
 */
exports.addDoctorSchedule = async (
  doctor_id,
  day_of_week,
  start_time,
  end_time,
  slot_duration,
) => {
  const sql = `
  INSERT INTO doctor_schedule
  (doctor_id,day_of_week,start_time,end_time,slot_duration)
  VALUES (?,?,?,?,?)
  `;

  const [result] = await db.query(sql, [
    doctor_id,
    day_of_week,
    start_time,
    end_time,
    slot_duration,
  ]);

  return result.insertId;
};

/**
 * ======================
 * GET DOCTOR SCHEDULE
 * ======================
 */
exports.getDoctorSchedule = async (doctor_id, date) => {
  const sql = `
  SELECT *
  FROM doctor_schedule
  WHERE doctor_id = ?
  AND day_of_week = DAYNAME(?)
  `;

  const [rows] = await db.query(sql, [doctor_id, date]);

  return rows;
};

/**
 * ======================
 * GET BOOKED SLOTS
 * ======================
 */
exports.getBookedSlots = async (doctor_id, date) => {
  const sql = `
  SELECT time
  FROM appointment
  WHERE doctor_id = ?
  AND date = ?
  `;

  const [rows] = await db.query(sql, [doctor_id, date]);

  return rows.map((r) => r.time);
};
exports.getDoctorFullSchedule = async (doctor_id) => {
  const sql = `
  SELECT *
  FROM doctor_schedule
  WHERE doctor_id = ?
  ORDER BY FIELD(day_of_week,
    'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')
  `;

  const [rows] = await db.query(sql, [doctor_id]);

  return rows;
};
/**
 * ======================
 * UPDATE DOCTOR SIGNATURE
 * ======================
 */
exports.updateDoctorSignature = async (doctor_id, signature) => {
  const sql = `
  UPDATE doctor
  SET signature = ?
  WHERE id = ?
  `;

  const [result] = await db.query(sql, [signature, doctor_id]);

  return result;
};
/**
 * ======================
 * GET DOCTOR SIGNATURE
 * ======================
 */
exports.getDoctorSignature = async (doctor_id) => {
  const sql = `
  SELECT signature
  FROM doctor
  WHERE id = ?
  `;

  const [rows] = await db.query(sql, [doctor_id]);

  return rows[0];
};
/**
 * ======================
 * GET DOCTORS BY DEPARTMENT
 * ======================
 */
exports.getDoctorsByDepartment = async (department) => {
  const sql = `
  SELECT *
  FROM doctor
  WHERE department = ?
  ORDER BY id DESC
  `;

  const [rows] = await db.query(sql, [department]);

  return rows;
};
exports.getAvailableSlots = async (doctor_id, date) => {
  const schedule = await this.getDoctorSchedule(doctor_id, date);

  if (!schedule.length) return [];

  const { start_time, end_time, slot_duration } = schedule[0];

  const slots = [];

  let start = new Date(`1970-01-01T${start_time}`);
  let end = new Date(`1970-01-01T${end_time}`);

  while (start < end) {
    const time = start.toTimeString().slice(0, 5);
    slots.push(time);
    start.setMinutes(start.getMinutes() + slot_duration);
  }

  // 🔥 booked slots (appointment se aayega)
  const [rows] = await db.query(
    `SELECT time FROM appointment WHERE doctor_id=? AND date=?`,
    [doctor_id, date],
  );

  const booked = rows.map((r) => r.time);

  return slots.filter((s) => !booked.includes(s));
};
exports.getAllDoctorSchedules = async () => {
  const sql = `
    SELECT 
      ds.*,
      CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
    FROM doctor_schedule ds
    JOIN doctor d ON d.id = ds.doctor_id
    ORDER BY ds.day_of_week
  `;

  const [rows] = await db.query(sql);
  return rows;
};
/**
 * ======================
 * GET DOCTOR BY USER ID
 * ======================
 */
exports.getDoctorByUserId = async (user_id) => {
  const sql = `
    SELECT *
    FROM doctor
    WHERE user_id = ?
  `;

  const [rows] = await db.query(sql, [user_id]);

  return rows[0];
};