const Dashboard = require("../models/dashboard.model");

exports.getDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await Dashboard.getDashboardStats(startDate, endDate);
    const appointments = await Dashboard.getAppointmentsByDate(startDate, endDate);
    const chart = await Dashboard.getPatientChart(startDate, endDate);

    res.json({
      success: true,
      data: {
        stats,
        appointments,
        chart,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
