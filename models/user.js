const db = require("../config/db");

/**
 * ======================
 * CREATE USER (ADMIN ONLY)
 * ======================
 */
exports.createUserByAdmin = async ({ username, email, password, role }) => {

  const sql = `
  INSERT INTO users (username, email, password, role, is_first_login)
  VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    username,
    email,
    password,
    role,
    true
  ]);

  return result.insertId;
};


/**
 * ======================
 * FIND USER BY USERNAME
 * ======================
 */
exports.findByUsername = async (username) => {

  const sql = `
  SELECT id, username, email, password, role, is_first_login
  FROM users
  WHERE username = ?
  LIMIT 1
  `;

  const [rows] = await db.query(sql, [username]);

  return rows[0];
};


/**
 * ======================
 * GET USER BY ID
 * ======================
 */
exports.getUserById = async (id) => {

  const sql = `
  SELECT id, username, email, role
  FROM users
  WHERE id = ?
  `;

  const [rows] = await db.query(sql, [id]);

  return rows[0];
};


/**
 * ======================
 * GET USERS BY ROLE
 * ======================
 */
exports.getUsersByRole = async (role) => {

  const sql = `
  SELECT id, username, email, role
  FROM users
  WHERE role = ?
  ORDER BY id DESC
  `;

  const [rows] = await db.query(sql, [role]);

  return rows;
};


/**
 * ======================
 * UPDATE PASSWORD
 * ======================
 */
exports.updatePassword = async (id, hashedPassword) => {

  const sql = `
  UPDATE users
  SET password = ?, is_first_login = ?
  WHERE id = ?
  `;

  const [result] = await db.query(sql, [
    hashedPassword,
    false,
    id
  ]);

  return result.affectedRows === 1;
};


/**
 * ======================
 * SAVE RESET TOKEN
 * ======================
 */
exports.saveResetToken = async (userId, token) => {

  const sql = `
  UPDATE users
  SET reset_token=?, reset_token_expiry=DATE_ADD(NOW(), INTERVAL 1 DAY)
  WHERE id=?
  `;

  await db.query(sql, [token, userId]);

};


/**
 * ======================
 * FIND BY RESET TOKEN
 * ======================
 */
exports.findByResetToken = async (token) => {

  const sql = `
  SELECT *
  FROM users
  WHERE reset_token = ?
  AND reset_token_expiry > NOW()
  LIMIT 1
  `;

  const [rows] = await db.query(sql, [token]);

  return rows[0];
};


/**
 * ======================
 * UPDATE PASSWORD BY TOKEN
 * ======================
 */
exports.updatePasswordByResetToken = async (token, password) => {

  const sql = `
  UPDATE users
  SET password = ?, reset_token = NULL, reset_token_expiry = NULL
  WHERE reset_token = ?
  `;

  await db.query(sql, [password, token]);

};
// models/user.js

exports.getUserByEmail = async (email) => {
  const [rows] = await db.query(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );
  return rows[0];
};