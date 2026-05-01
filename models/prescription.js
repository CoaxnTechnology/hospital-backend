const db = require("../config/db");

/**
 * ======================
 * CREATE PRESCRIPTION
 * ======================
 */
exports.createPrescription = async (data) => {
  console.log("📥 MODEL: CREATE PRESCRIPTION DATA:", data);

  const sql = `INSERT INTO prescription SET ?`;

  const [result] = await db.query(sql, data);

  console.log("✅ MODEL: PRESCRIPTION INSERTED ID:", result.insertId);

  return result.insertId;
};

/**
 * ======================
 * ADD MEDICINES
 * ======================
 */
exports.addMedicines = async (prescriptionId, medicines) => {
  console.log("📥 MODEL: ADD MEDICINES:", medicines);

  const values = medicines.map((med) => [
    prescriptionId,
    med.name,
    med.dosage,
    med.duration,
    med.timing,
    med.frequency,
    med.instruction,
  ]);

  console.log("📊 INSERT VALUES:", values);

  const sql = `
  INSERT INTO prescription_medicine
  (prescription_id, medicine_name, dosage, duration, timing, frequency, instruction)
  VALUES ?
  `;

  await db.query(sql, [values]);

  console.log("✅ MODEL: MEDICINES INSERTED");
};

/**
 * ======================
 * UPDATE APPOINTMENT STATUS
 * ======================
 */
exports.updateAppointmentStatus = async (appointment_id) => {
  console.log("🔄 MODEL: UPDATE APPOINTMENT STATUS:", appointment_id);

  const sql = `
  UPDATE appointment
  SET status='Prescription Added'
  WHERE id=?
  `;

  await db.query(sql, [appointment_id]);

  console.log("✅ MODEL: APPOINTMENT UPDATED");
};

/**
 * ======================
 * GET FULL PRESCRIPTION
 * ======================
 */
exports.getFullPrescription = async (id) => {
  console.log("📥 MODEL: GET FULL PRESCRIPTION ID:", id);

  const sql = `
  SELECT 
    pr.id,
    pr.patient_id,
    pr.diagnosis,

    pt.name AS patient_name,
    pt.phone AS mobile,
    pt.age,

    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    a.department,  -- ✅ ADD THIS

    pm.medicine_name,
    pm.dosage,
    pm.duration,
    pm.timing,
    pm.frequency,
    pm.instruction,

    m.selling_price,
    m.gst_percentage,
    m.quantity AS stock

  FROM prescription pr

  LEFT JOIN patient pt 
    ON pt.id = pr.patient_id

  LEFT JOIN doctor d 
    ON d.id = pr.doctor_id

  LEFT JOIN appointment a   -- ✅ IMPORTANT JOIN
    ON a.id = pr.appointment_id

  LEFT JOIN prescription_medicine pm 
    ON pm.prescription_id = pr.id

  LEFT JOIN medicine m
    ON LOWER(m.name) LIKE CONCAT('%', LOWER(pm.medicine_name), '%')

  WHERE pr.id = ?
  `;

  const [rows] = await db.query(sql, [id]);

  console.log("📊 MODEL: FULL PRESCRIPTION RESULT:", rows);

  // 🔍 DEBUG CHECK
  if (rows.length > 0) {
    console.log("🏥 DEPARTMENT CHECK:", rows[0].department);
  }

  return rows;
};
