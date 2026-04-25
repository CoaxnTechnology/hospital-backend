require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const doctorRoutes = require("./routes/doctor.routes");
const authRoutes = require("./routes/auth.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const employeeRoutes = require("./routes/employee.routes");
const prescriptionRoutes = require("./routes/prescription.routes");
const departmentRoutes = require("./routes/department.routes");
const leaveRoutes = require("./routes/leave.routes");
const medicineRoutes = require("./routes/medicine.routes");
const patientRoutes = require("./routes/patient.routes");
const salesRoutes = require("./routes/sale.routes");
const medicineBrandRoutes = require("./routes/medicinebrand.routes");
const dosageroutes = require("./routes/dosage.routes");
const strengthRoutes = require("./routes/strength.routes");
const medicinesuplierRoutes = require("./routes/supplier.routes");
const medicinecategoryRoutes = require("./routes/category.routes");
const hospitaldetailsRoutes = require("./routes/hospital.routes");
const heroroutes = require("./routes/hero.routes");
const servicesRoutes = require("./routes/services.routes");
const blogRoutes = require("./routes/blog.routes");
const branchRoutes = require("./routes/branch.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const contactRoutes = require("./routes/contact.routes");
const app = express();

/* =========================
MIDDLEWARE
========================= */
app.use(
  cors({
    origin: "*", // Allow all origins (not recommended for production)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require("path");

app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/public", express.static("public"));
/* =========================
ROUTES
========================= */
app.use("/api/doctors", doctorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api", medicineBrandRoutes);
app.use("/api", dosageroutes);
app.use("/api/sales", salesRoutes);
app.use("/api", strengthRoutes);
app.use("/api", medicinesuplierRoutes);
app.use("/api", medicinecategoryRoutes);
app.use("/api", hospitaldetailsRoutes);
app.use("/api/hero", heroroutes);
app.use("/api/services", servicesRoutes);
app.use("/api/blogs", blogRoutes);

app.use("/branches", branchRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/contact", contactRoutes);
/* =========================
TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

/* =========================
EXPORT (IMPORTANT FOR VERCEL)
========================= */
module.exports = app;
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
