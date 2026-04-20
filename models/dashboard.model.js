const db = require("../config/db");

exports.getDashboardStats = async (startDate, endDate) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM doctor) AS total_doctors,

      (SELECT COUNT(*) FROM appointment 
        WHERE date BETWEEN ? AND ?) AS total_appointments,

      (SELECT COUNT(*) FROM appointment 
        WHERE status='Completed' 
        AND date BETWEEN ? AND ?) AS completed,

      (SELECT COUNT(*) FROM appointment 
        WHERE status='Pending' 
        AND date BETWEEN ? AND ?) AS pending
  `;

  const [rows] = await db.query(sql, [
    startDate,
    endDate,
    startDate,
    endDate,
    startDate,
    endDate,
  ]);

  return rows[0];
};

/**
 * 🔥 APPOINTMENT LIST (FILTER)
 */
exports.getAppointmentsByDate = async (startDate, endDate) => {
  const sql = `
    SELECT 
      a.id,
      a.date,
      a.time,
      a.status,
      p.name AS patient_name,
      CONCAT(d.first_name,' ',d.last_name) AS doctor_name
    FROM appointment a
    JOIN patient p ON p.id = a.patient_id
    JOIN doctor d ON d.id = a.doctor_id
    WHERE a.date BETWEEN ? AND ?
    ORDER BY a.date DESC
  `;

  const [rows] = await db.query(sql, [startDate, endDate]);

  return rows;
};

/**
 * 🔥 CHART DATA
 */
exports.getPatientChart = async (startDate, endDate) => {
  const sql = `
    SELECT 
      DATE_FORMAT(date, '%b') AS month,
      MONTH(date) AS month_num,
      COUNT(*) AS patients
    FROM appointment
    WHERE date BETWEEN ? AND ?
    GROUP BY MONTH(date), DATE_FORMAT(date, '%b')
    ORDER BY month_num
  `;

  const [rows] = await db.query(sql, [startDate, endDate]);

  return rows;
};
