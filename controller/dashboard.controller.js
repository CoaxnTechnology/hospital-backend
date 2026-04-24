const Dashboard = require("../models/dashboard.model");
exports.getDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log("📥 API HIT getDashboard");
    console.log("📅 startDate:", startDate);
    console.log("📅 endDate:", endDate);

    const stats = await Dashboard.getDashboardStats(startDate, endDate);
    console.log("📊 STATS RESULT:", stats);

    const appointments = await Dashboard.getAppointmentsByDate(startDate, endDate);
    console.log("📋 APPOINTMENTS RESULT:", appointments.length, appointments);

    const chart = await Dashboard.getPatientChart(startDate, endDate);
    console.log("📈 CHART RESULT:", chart);

    res.json({
      success: true,
      data: {
        stats,
        appointments,
        chart,
      },
    });
  } catch (err) {
    console.error("❌ DASHBOARD ERROR:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};