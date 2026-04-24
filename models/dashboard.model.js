const db = require("../config/db");

exports.getDashboardStats = async (startDate, endDate) => {
  console.log("📊 getDashboardStats called");
  console.log("➡️ startDate:", startDate);
  console.log("➡️ endDate:", endDate);

  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM doctor) AS total_doctors,

      -- 🔥 FIX: DATE() added
      (SELECT COUNT(*) FROM appointment 
        WHERE status IN ('Completed','Pending')
        AND DATE(date) BETWEEN ? AND ?) AS total_appointments,

      (SELECT COUNT(*) FROM appointment 
        WHERE status='Completed' 
        AND DATE(date) BETWEEN ? AND ?) AS completed,

      (SELECT COUNT(*) FROM appointment 
        WHERE status='Pending' 
        AND DATE(date) BETWEEN ? AND ?) AS pending
  `;

  console.log("📡 SQL:", sql);

  const [rows] = await db.query(sql, [
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
 * 🔥 APPOINTMENT LIST (FILTER)
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
  LEFT JOIN patient p ON p.id = a.patient_id   -- 🔥 FIX
  LEFT JOIN doctor d ON d.id = a.doctor_id     -- 🔥 FIX
  WHERE DATE(a.date) BETWEEN ? AND ?
    AND a.status IN ('Completed','Pending')
  ORDER BY a.date DESC
`;

  console.log("📡 SQL:", sql);

  const [rows] = await db.query(sql, [startDate, endDate]);

  console.log("📥 APPOINTMENTS DB RESULT:", rows.length, rows);

  return rows;
};
/**
 * 🔥 CHART DATA
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
    WHERE DATE(date) BETWEEN ? AND ?   -- 🔥 FIX HERE
      AND status IN ('Completed','Pending')
    GROUP BY MONTH(date), DATE_FORMAT(date, '%b')
    ORDER BY month_num
  `;

  console.log("📡 SQL:", sql);

  const [rows] = await db.query(sql, [startDate, endDate]);

  console.log("📥 CHART DB RESULT:", rows);

  return rows;
};
