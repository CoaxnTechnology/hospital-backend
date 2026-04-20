const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Employee = require("../models/employee.model");
const { generatePassword } = require("../utils/password.util");
const { sendCredentialEmail } = require("../utils/email.util");

exports.createEmployee = async (req, res) => {
  try {

    const { name, email, phone, designation, joinDate } = req.body;

    if (!name || !email || !designation) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    /* ======================
       1️⃣ GENERATE PASSWORD
    ====================== */
    const tempPassword = generatePassword();

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    /* ======================
       2️⃣ CREATE USER (AUTH)
    ====================== */
    const userId = await User.createUserByAdmin({
      username: email,
      email,
      password: hashedPassword,
      role: "staff",
    });

    /* ======================
       3️⃣ CREATE EMPLOYEE (BUSINESS)
    ====================== */
    await Employee.addEmployee(
      userId,
      name,
      email,
      phone,
      joinDate,
      "staff",
      designation,
      null
    );

    /* ======================
       4️⃣ SEND EMAIL
    ====================== */
    await sendCredentialEmail(email, {
      username: email,
      password: tempPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Employee created & credentials sent",
    });

  } catch (error) {

    console.error("CREATE EMPLOYEE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};