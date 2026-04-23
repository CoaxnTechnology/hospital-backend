const db = require("../config/db");

/**
 * ======================
 * CREATE PRESCRIPTION
 * ======================
 */
exports.createPrescription = async (data) => {
  const sql = `INSERT INTO prescription SET ?`;

  const [result] = await db.query(sql, data);

  return result.insertId;
};

/**
 * ======================
 * ADD MEDICINES
 * ======================
 */
exports.addMedicines = async (prescriptionId, medicines) => {
  const values = medicines.map((med) => [
    prescriptionId,
    med.name,
    med.dosage,
    med.duration,
  ]);

  const sql = `
  INSERT INTO prescription_medicine
  (prescription_id, medicine_name, dosage, duration)
  VALUES ?
  `;

  await db.query(sql, [values]);
};


/**
 * ======================
 * UPDATE APPOINTMENT STATUS
 * ======================
 */
exports.updateAppointmentStatus = async (appointment_id) => {
  const sql = `
  UPDATE appointment
  SET status='Prescription Added'
  WHERE id=?
  `;

  await db.query(sql, [appointment_id]);
};
exports.getFullPrescription = async (id) => {
  const sql = `
  SELECT 
    pr.id,
    pr.patient_id,

    pt.name AS patient_name,
    pt.phone AS mobile,
    pt.age,

    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,

    pm.medicine_name,
    pm.dosage,
    pm.duration,

    m.selling_price,
    m.gst_percentage,
    m.quantity AS stock   -- ✅ ADD THIS LINE

  FROM prescription pr

  LEFT JOIN patient pt 
    ON pt.id = pr.patient_id

  LEFT JOIN doctor d 
    ON d.id = pr.doctor_id

  LEFT JOIN prescription_medicine pm 
    ON pm.prescription_id = pr.id

  LEFT JOIN medicine m
    ON LOWER(m.name) LIKE CONCAT('%', LOWER(pm.medicine_name), '%')

  WHERE pr.id = ?
  `;

  const [rows] = await db.query(sql, [id]);

  return rows;
};
