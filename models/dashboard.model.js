const db = require("../config/db");

/**
 * =========================
 * 🔥 DASHBOARD STATS
 * =========================
 */
exports.getDashboardStats = async (startDate, endDate) => {
  console.log("📊 getDashboardStats called");
  console.log("➡️ startDate:", startDate);
  console.log("➡️ endDate:", endDate);

  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM doctor) AS total_doctors,

      -- 🔥 ALL STATUS INCLUDED
      (SELECT COUNT(*) FROM appointment 
        WHERE DATE(date) BETWEEN ? AND ?) AS total_appointments,

      (SELECT COUNT(*) FROM appointment 
        WHERE status='Completed' 
        AND DATE(date) BETWEEN ? AND ?) AS completed,

      (SELECT COUNT(*) FROM appointment 
        WHERE status='Pending' 
        AND DATE(date) BETWEEN ? AND ?) AS pending,

      (SELECT COUNT(*) FROM appointment 
        WHERE status='Skipped' 
        AND DATE(date) BETWEEN ? AND ?) AS skipped,

      (SELECT COUNT(*) FROM appointment 
        WHERE status='In Consultation' 
        AND DATE(date) BETWEEN ? AND ?) AS in_consultation
  `;

  console.log("📡 SQL:", sql);

  const [rows] = await db.query(sql, [
    startDate,
    endDate,
    startDate,
    endDate,
    startDate,
    endDate,
    startDate,
    endDate,
    startDate,
    endDate,
  ]);

  console.log("📥 STATS DB RESULT:", rows);

  return rows[0];
};

/**
 * =========================
 * 🔥 APPOINTMENT LIST (ALL STATUS)
 * =========================
 */
exports.getAppointmentsByDate = async (startDate, endDate) => {
  console.log("📋 getAppointmentsByDate called");
  console.log("➡️ startDate:", startDate);
  console.log("➡️ endDate:", endDate);

  const sql = `
    SELECT 
      a.id,
      a.date,
      a.time,
      a.status,
      p.name AS patient_name,
      CONCAT(d.first_name,' ',d.last_name) AS doctor_name
    FROM appointment a
    LEFT JOIN patient p ON p.id = a.patient_id
    LEFT JOIN doctor d ON d.id = a.doctor_id
    WHERE DATE(a.date) BETWEEN ? AND ?
    ORDER BY a.date DESC
  `;

  console.log("📡 SQL:", sql);

  const [rows] = await db.query(sql, [startDate, endDate]);

  console.log("📥 APPOINTMENTS COUNT:", rows.length);
  console.log("📥 APPOINTMENTS DATA:", rows);

  return rows;
};

/**
 * =========================
 * 🔥 CHART DATA (ALL STATUS)
 * =========================
 */
exports.getPatientChart = async (startDate, endDate) => {
  console.log("📈 getPatientChart called");
  console.log("➡️ startDate:", startDate);
  console.log("➡️ endDate:", endDate);

  const sql = `
    SELECT 
      DATE_FORMAT(date, '%b') AS month,
      MONTH(date) AS month_num,
      COUNT(*) AS patients
    FROM appointment
    WHERE DATE(date) BETWEEN ? AND ?
    GROUP BY MONTH(date), DATE_FORMAT(date, '%b')
    ORDER BY month_num
  `;

  console.log("📡 SQL:", sql);

  const [rows] = await db.query(sql, [startDate, endDate]);

  console.log("📥 CHART DATA:", rows);

  return rows;
};