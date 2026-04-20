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
 * UPDATE PDF PATH
 * ======================
 */
exports.updatePdfPath = async (id, path) => {
  const sql = `
  UPDATE prescription
  SET pdf_path=?
  WHERE id=?
  `;

  await db.query(sql, [path, id]);
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
exports.getFullPrescription = async (appointment_id) => {
  const sql = `
  SELECT 
    pr.*,
    pm.medicine_name,
    pm.dosage,
    pm.duration
  FROM prescription pr
  LEFT JOIN prescription_medicine pm 
    ON pm.prescription_id = pr.id
  WHERE pr.appointment_id = ?
  `;

  const [rows] = await db.query(sql, [appointment_id]);

  return rows;
};
