const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send reset password email
 */
exports.sendResetPasswordEmail = async (email, token) => {
  // 🔥 CHANGE HERE
  const FRONTEND_URL =
    process.env.FRONTEND_URL || "https://clinic.clinicalgynecologists.space";

  const resetLink = `${FRONTEND_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: `"Hospital Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Set your password",
    html: `
      <h3>Doctor Account Created</h3>
      <p>Click the link below to set your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });
};
/**
 * ==============================
 * CONTACT FORM EMAIL 🔥 NEW
 * ==============================
 */
exports.sendContactEmail = async (data) => {
  const { name, email, phone, message } = data;

  try {
    const info = await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Contact Query",
      html: `
        <h3>New Contact Form Submission</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    console.log("✅ EMAIL SENT:", info.response); // 🔥 ADD THIS
  } catch (err) {
    console.error("❌ MAIL ERROR:", err); // 🔥 ADD THIS
    throw err;
  }
};
