const Employee = require("../models/employee");
const User = require("../models/user");
const { generateResetToken } = require("../utils/token.util");
const { sendResetPasswordEmail } = require("../utils/email.util");

/**
 * ======================
 * GET ALL EMPLOYEES
 * ======================
 */
exports.getAllEmployees = async (req, res) => {
  try {

    const result = await Employee.getAllemployee();

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    console.error("GET ALL EMPLOYEES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });

  }
};


/**
 * ======================
 * GET EMPLOYEE BY ID
 * ======================
 */
exports.getEmployeeById = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await Employee.getEmpbyId(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    console.error("GET EMPLOYEE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};


/**
 * ======================
 * UPDATE EMPLOYEE
 * ======================
 */
exports.updateEmployee = async (req, res) => {

  try {

    const { id } = req.params;
    const { name, email, contact, join_date, designation, salary } = req.body;

    await Employee.editEmp(
      id,
      name,
      email,
      contact,
      join_date,
      "staff",
      designation,
      salary
    );

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
    });

  } catch (error) {

    console.error("UPDATE EMPLOYEE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update employee",
    });

  }

};


/**
 * ======================
 * DELETE EMPLOYEE
 * ======================
 */
exports.deleteEmployee = async (req, res) => {

  try {

    const { id } = req.params;

    await Employee.deleteEmp(id);

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });

  } catch (error) {

    console.error("DELETE EMPLOYEE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete employee",
    });

  }

};


/**
 * ======================
 * GET MY PROFILE (EMPLOYEE)
 * ======================
 */
exports.getMyProfile = async (req, res) => {

  try {

    const user_id = req.user.id;

    const result = await Employee.getEmpByUserId(user_id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};


/**
 * ======================
 * CREATE EMPLOYEE
 * ======================
 */
exports.addEmployee = async (req, res) => {

  try {

    const { name, email, contact, join_date, designation, salary } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    /**
     * 1️⃣ Create user
     */
    const userId = await User.createUserByAdmin({
      username: email,
      email,
      password: "",
      role: "staff",
    });

    /**
     * 2️⃣ Create employee profile
     */
    await Employee.addEmployee(
      userId,
      name,
      email,
      contact,
      join_date,
      "staff",
      designation,
      salary || 0
    );

    /**
     * 3️⃣ Generate reset token
     */
    const resetToken = generateResetToken();

    await User.saveResetToken(userId, resetToken);

    /**
     * 4️⃣ Send email
     */
    await sendResetPasswordEmail(email, resetToken);

    return res.status(201).json({
      success: true,
      message: "Employee created. Password reset link sent.",
    });

  } catch (error) {

    console.error("CREATE EMPLOYEE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }

};
/**
 * ======================
 * RESEND RESET LINK
 * ======================
 */
exports.resendResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    /**
     * 1️⃣ FIND USER
     */
    const user = await User.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /**
     * 2️⃣ CHECK CONDITION
     * 👉 only if password not set OR first login
     */
    if (user.is_first_login === 0 && user.password) {
      return res.status(400).json({
        success: false,
        message: "User already set password",
      });
    }

    /**
     * 3️⃣ GENERATE NEW TOKEN
     */
    const resetToken = generateResetToken();

    /**
     * 4️⃣ SAVE TOKEN
     */
    await User.saveResetToken(user.id, resetToken);

    /**
     * 5️⃣ SEND EMAIL AGAIN
     */
    await sendResetPasswordEmail(user.email, resetToken);

    return res.json({
      success: true,
      message: "Reset link sent successfully",
    });

  } catch (error) {
    console.error("RESEND RESET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};