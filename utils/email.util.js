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