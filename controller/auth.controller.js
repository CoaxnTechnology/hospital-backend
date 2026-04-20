const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

/**
 * ======================
 * LOGIN
 * ======================
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    /**
     * 🔥 USER + DOCTOR JOIN (EMAIL BASED)
     */
    const [rows] = await db.query(
      `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.password,
        u.role,
        u.is_first_login,
        d.first_name,
        d.last_name,
        d.image
      FROM users u
      LEFT JOIN doctor d ON d.email = u.email   -- ✅ FIX
      WHERE u.username = ?
      LIMIT 1
      `,
      [username]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    /**
     * 🔐 PASSWORD CHECK
     */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    /**
     * 🔑 TOKEN
     */
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    /**
     * 🎯 FINAL RESPONSE
     */
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isFirstLogin: user.is_first_login,

        // ✅ NAME
        name: user.first_name
          ? `${user.first_name} ${user.last_name}`
          : user.username,

        // ✅ IMAGE
        image: user.image || null,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * ======================
 * RESET PASSWORD
 * ======================
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password required",
      });
    }

    const [rows] = await db.query(
      `SELECT id FROM users
       WHERE reset_token = ?
       AND reset_token_expiry > NOW()`,
      [token],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users
       SET password = ?, 
           reset_token = NULL, 
           reset_token_expiry = NULL, 
           is_first_login = false
       WHERE id = ?`,
      [hashedPassword, rows[0].id],
    );

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
