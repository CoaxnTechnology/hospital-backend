const db = require("../config/db");

/* ======================
   CREATE PATIENT
====================== */
exports.createPatient = async (data) => {
  const { name, email, phone, gender, dob } = data;

  const sql = `
  INSERT INTO patient
  (name, email, phone, gender, dob)
  VALUES (?, ?, ?, ?, ?)
  `;

  console.log("📝 Creating Patient:", data);

  const [result] = await db.query(sql, [name, email, phone, gender, dob]);

  console.log("✅ Patient Created ID:", result.insertId);

  return result;
};

/* ======================
   GET ALL PATIENTS
====================== */
exports.getAllPatients = async () => {
  const sql = `
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    p.gender,
    p.dob,
      p.age,
    p.created_at,
    COUNT(a.id) AS total_visits,
    MAX(a.date) AS last_visit
  FROM patient p
  LEFT JOIN appointment a ON a.patient_id = p.id
  GROUP BY p.id
  ORDER BY p.created_at DESC
  `;

  console.log("📡 Executing getAllPatients");

  const [rows] = await db.query(sql);

  console.log("✅ getAllPatients RESULT:", rows);

  return rows;
};

/* ======================
   GET PATIENT BY ID
====================== */
exports.getPatientById = async (id) => {
  const sql = `
  SELECT *
  FROM patient
  WHERE id = ?
  `;

  console.log("📡 Executing getPatientById:", id);

  const [rows] = await db.query(sql, [id]);

  return rows[0];
};

/* ======================
   UPDATE PATIENT
====================== */
exports.updatePatient = async (id, data) => {
  const { name, email, phone, gender, dob } = data;

  const sql = `
  UPDATE patient SET
    name = ?,
    email = ?,
    phone = ?,
    gender = ?,
    dob = ?
  WHERE id = ?
  `;

  console.log("✏ Updating Patient:", id);

  const [result] = await db.query(sql, [name, email, phone, gender, dob, id]);

  return result;
};

/* ======================
   DELETE PATIENT
====================== */
exports.deletePatient = async (id) => {
  console.log("🗑 Deleting Patient:", id);

  const [result] = await db.query("DELETE FROM patient WHERE id = ?", [id]);

  return result;
};

/* ======================
   GET PATIENT HISTORY
====================== */
exports.getPatientHistory = async (patient_id) => {
  const sql = `
 SELECT
  a.id AS appointment_id,
  a.date,
  a.time,
  a.department,
  a.status,
  CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
  pr.id AS prescription_id,
  pr.pdf_path,
  pr.created_at AS prescription_date
FROM appointment a
JOIN doctor d ON d.id = a.doctor_id
LEFT JOIN prescription pr ON pr.appointment_id = a.id
WHERE a.patient_id = ?
ORDER BY a.date DESC
  `;
  console.log("📡 Executing getPatientHistory");

  const [rows] = await db.query(sql, [patient_id]);

  return rows;
};

/* ======================
   GET LAST APPOINTMENT
====================== */
exports.getLastAppointment = async (patient_id) => {
  const sql = `
  SELECT *
  FROM appointment
  WHERE patient_id = ?
  ORDER BY appointment_date DESC
  LIMIT 1
  `;

  console.log("📡 Executing getLastAppointment:", patient_id);

  const [rows] = await db.query(sql, [patient_id]);

  return rows[0];
};
exports.getAllPatientsPaginated = async (
  limit,
  offset,
  search,
  role,
  userId,
  doctorName,
) => {
  let where = "WHERE 1=1";
  let values = [];

  // 🔍 SEARCH
  if (search) {
    const isNumber = !isNaN(search);

    if (isNumber) {
      if (search.length >= 10) {
        where += " AND p.phone LIKE ?";
        values.push(`%${search}%`);
      } else {
        where += " AND p.id = ?";
        values.push(Number(search));
      }
    } else {
      where += " AND LOWER(p.name) LIKE LOWER(?)";
      values.push(`%${search}%`);
    }
  }

  // 👨‍⚕️ DOCTOR LOGIN FILTER
  if (role === "doctor") {
    where += " AND a.doctor_id = ?";
    values.push(userId);
  }

  // 👑 ADMIN FILTER BY DOCTOR NAME
  if (role === "admin" && doctorName) {
    where += " AND CONCAT(d.first_name, ' ', d.last_name) LIKE ?";
    values.push(`%${doctorName}%`);
  }

  const sql = `
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    p.gender,
    p.dob,
    p.age,
    p.created_at,

    COUNT(a.id) AS total_visits,
    MAX(a.date) AS last_visit,

    SUBSTRING_INDEX(
      GROUP_CONCAT(CONCAT(d.first_name, ' ', d.last_name) ORDER BY a.date DESC),
      ',', 
      1
    ) AS doctor_name

  FROM patient p
  LEFT JOIN appointment a ON a.patient_id = p.id
  LEFT JOIN doctor d ON d.id = a.doctor_id
  ${where}
  GROUP BY p.id
  ORDER BY p.created_at DESC
  LIMIT ? OFFSET ?
`;

  const [rows] = await db.query(sql, [...values, limit, offset]);

  const countSql = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM patient p
    LEFT JOIN appointment a ON a.patient_id = p.id
    LEFT JOIN doctor d ON d.id = a.doctor_id
    ${where}
  `;

  const [countResult] = await db.query(countSql, values);

  return {
    data: rows,
    total: countResult[0].total,
  };
};
