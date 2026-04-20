const db = require("../config/db");

/**
 * ======================
 * GENERATE TOKEN
 * ======================
 */
/**
 * ======================
 * GENERATE TOKEN
 * ======================
 */
exports.generateToken = async (doctor_id, date) => {
  const [rows] = await db.query(
    `SELECT MAX(token_number) AS token
     FROM appointment
     WHERE doctor_id=? AND date=?`,
    [doctor_id, date],
  );

  return (rows[0].token || 0) + 1;
};

/**
 * ======================
 * NORMALIZE TIME (IMPORTANT)
 * ======================
 */
const normalizeTime = (time) => {
  if (!time) return "";
  return time.slice(0, 5); // HH:mm
};

/**
 * ======================
 * CREATE APPOINTMENT
 * ======================
 */
exports.addAppointment = async (data) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    console.log("🚀 ADD APPOINTMENT START");

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
    } = data;

    console.log("📥 INPUT:", data);

    // 🔥 SAFE AGE PARSE
    const parsedAge =
      age !== undefined && age !== "" ? Number(age) : null;

    let finalPatientId = patient_id;

    /**
     * ======================
     * CASE 1: patient_id given
     * ======================
     */
    if (finalPatientId) {
      const [rows] = await connection.query(
        `SELECT id FROM patient WHERE id=?`,
        [finalPatientId]
      );

      if (!rows.length) {
        throw new Error("Invalid patient ID");
      }
    } else {
      /**
       * ======================
       * NEW / EXISTING PATIENT
       * ======================
       */
      if (!patient_name || !phone) {
        throw new Error("Patient details required");
      }

      try {
        // 🔥 CREATE NEW PATIENT
        const [insert] = await connection.query(
          `INSERT INTO patient (name, phone, age, gender)
           VALUES (?, ?, ?, ?)`,
          [
            patient_name,
            phone,
            parsedAge,
            gender || null,
          ]
        );

        finalPatientId = insert.insertId;

        console.log("🆕 NEW PATIENT CREATED:", finalPatientId);
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          // 🔥 EXISTING PATIENT
          const [rows] = await connection.query(
            `SELECT id FROM patient WHERE phone=?`,
            [phone]
          );

          if (!rows.length) {
            throw new Error("Failed to fetch existing patient");
          }

          finalPatientId = rows[0].id;

          console.log("♻️ EXISTING PATIENT USED:", finalPatientId);

          // 🔥 SAFE UPDATE (DO NOT OVERWRITE WITH NULL)
          await connection.query(
            `UPDATE patient 
             SET 
               age = COALESCE(?, age),
               gender = COALESCE(?, gender)
             WHERE id=?`,
            [
              parsedAge,
              gender || null,
              finalPatientId,
            ]
          );

          console.log("🔄 PATIENT UPDATED");
        } else {
          throw err;
        }
      }
    }

    /**
     * ======================
     * NORMALIZE TIME
     * ======================
     */
    const normalizedTime = normalizeTime(time);
    console.log("⏱ TIME:", normalizedTime);

    /**
     * ======================
     * GENERATE TOKEN
     * ======================
     */
    const token = await this.generateToken(doctor_id, date);
    console.log("🎟 TOKEN:", token);

    /**
     * ======================
     * INSERT APPOINTMENT
     * ======================
     */
    const [appointment] = await connection.query(
      `INSERT INTO appointment
      (patient_id, doctor_id, department, date, time, problem, token_number, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        finalPatientId,
        doctor_id,
        department,
        date,
        normalizedTime,
        problem,
        token,
      ]
    );

    await connection.commit();

    console.log("✅ APPOINTMENT CREATED:", appointment.insertId);

    return {
      appointment_id: appointment.insertId,
      token,
    };
  } catch (err) {
    await connection.rollback();

    console.error("❌ ERROR:", err);

    if (err.code === "ER_DUP_ENTRY") {
      throw new Error("Slot already booked");
    }

    throw err;
  } finally {
    connection.release();
  }
};

/**
 * ======================
 * GET DOCTOR APPOINTMENTS (TODAY)
 * ======================
 */

exports.getDoctorAppointments = async (doctor_id) => {
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
  AND a.date = CURDATE()
  AND a.status IN (
    'In Consultation',
    'Prescription Added',
    'Skipped'
  )
  ORDER BY a.token_number ASC
  `;

  const [rows] = await db.query(sql, [doctor_id]);

  return rows;
};

/**
 * ======================
 * GET ALL APPOINTMENTS
 * ======================
 */

exports.getAllAppointments = async (filter, customDate) => {
  let where = "";
  let values = [];

  if (filter === "today") {
    where = "WHERE DATE(a.date) = CURDATE()";
  } else if (filter === "tomorrow") {
    where = "WHERE DATE(a.date) = CURDATE() + INTERVAL 1 DAY";
  } else if (filter === "yesterday") {
    where = "WHERE DATE(a.date) = CURDATE() - INTERVAL 1 DAY";
  } else if (filter === "custom" && customDate) {
    where = "WHERE DATE(a.date) = ?";
    values.push(customDate);
  }

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
    CONCAT(d.first_name,' ',d.last_name) AS doctor_name
  FROM appointment a
  JOIN patient p ON p.id = a.patient_id
  JOIN doctor d ON d.id = a.doctor_id
  ${where}
  ORDER BY a.date DESC, a.token_number ASC
  `;

  const [rows] = await db.query(sql, values);

  return rows;
};
/**
 * ======================
 * NEXT PATIENT
 * ======================
 */

exports.nextPatient = async (doctor_id, date) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    console.log("➡️ NEXT PATIENT CALLED");

    // ❌ pehle existing active hatao
    await connection.query(
      `UPDATE appointment
       SET status='Pending'
       WHERE doctor_id=? AND date=? AND status='In Consultation'`,
      [doctor_id, date],
    );

    // ✅ next patient active karo
    await connection.query(
      `UPDATE appointment
       SET status='In Consultation'
       WHERE id = (
         SELECT id FROM (
           SELECT id
           FROM appointment
           WHERE doctor_id=? AND date=? AND status='Pending'
           ORDER BY token_number ASC
           LIMIT 1
         ) AS t
       )`,
      [doctor_id, date],
    );

    await connection.commit();

    console.log("✅ NEXT PATIENT SET");
  } catch (err) {
    await connection.rollback();
    console.error("❌ NEXT PATIENT ERROR:", err);
    throw err;
  } finally {
    connection.release();
  }
};

/**
 * ======================
 * COMPLETE CONSULTATION
 * ======================
 */

exports.completeConsultation = async (id, doctor_id, date) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE appointment
       SET status='Completed'
       WHERE id=?`,
      [id],
    );

    await connection.query(
      `UPDATE appointment
       SET status='In Consultation'
       WHERE id = (
         SELECT id FROM (
           SELECT id
           FROM appointment
           WHERE doctor_id=?
           AND date=?
           AND status='Pending'
           ORDER BY token_number ASC
           LIMIT 1
         ) AS t
       )`,
      [doctor_id, date],
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

/**
 * ======================
 * SKIP PATIENT
 * ======================
 */

exports.skipPatient = async ({ id, doctor_id, date }) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    console.log("⏭ SKIP PATIENT:", { id, doctor_id, date });

    // ✅ FIXED QUERY
    await connection.query(
      `UPDATE appointment 
       SET status='Skipped' 
       WHERE id = ? AND doctor_id = ? AND date = ?`,
      [id, doctor_id, date],
    );

    // ✅ NEXT PATIENT AUTO CALL
    await connection.query(
      `UPDATE appointment
       SET status='In Consultation'
       WHERE id = (
         SELECT id FROM (
           SELECT id
           FROM appointment
           WHERE doctor_id=? AND date=? AND status='Pending'
           ORDER BY token_number ASC
           LIMIT 1
         ) AS t
       )`,
      [doctor_id, date],
    );

    await connection.commit();

    console.log("✅ SKIPPED + NEXT PATIENT CALLED");
  } catch (err) {
    await connection.rollback();
    console.error("❌ SKIP ERROR:", err);
    throw err;
  } finally {
    connection.release();
  }
};

/**
 * ======================
 * RECALL PATIENT
 * ======================
 */

exports.recallPatient = async (id) => {
  const [result] = await db.query(
    `UPDATE appointment
     SET status='In Consultation'
     WHERE id=?`,
    [id],
  );

  return result;
};
/**
 * ======================
 * GET APPOINTMENT BY ID
 * ======================
 */
exports.getAppointmentById = async (id) => {
  console.log("📡 GET APPOINTMENT BY ID:", id);

  const sql = `
  SELECT 
    a.*,
    p.name AS patient_name,
    p.phone AS patient_phone,
    CONCAT(d.first_name,' ',d.last_name) AS doctor_name
  FROM appointment a
  JOIN patient p ON p.id = a.patient_id
  JOIN doctor d ON d.id = a.doctor_id
  WHERE a.id = ?
  `;

  const [rows] = await db.query(sql, [id]);

  console.log("📥 RESULT:", rows);

  return rows[0];
};
