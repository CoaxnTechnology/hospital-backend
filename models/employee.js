const db = require("../config/db");

/**
 * ======================
 * ADD EMPLOYEE
 * ======================
 */
exports.addEmployee = async (
  user_id,
  name,
  email,
  contact,
  join_date,
  role,
  designation,
  salary
) => {

  const sql = `
  INSERT INTO employee
  (user_id, name, email, contact, join_date, role, designation, salary)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    user_id,
    name,
    email,
    contact,
    join_date,
    role,
    designation,
    salary
  ]);

  return result.insertId;
};


/**
 * ======================
 * GET EMPLOYEE BY ID
 * ======================
 */
exports.getEmpbyId = async (id) => {

  const sql = `SELECT * FROM employee WHERE id = ?`;

  const [rows] = await db.query(sql, [id]);

  return rows[0];
};


/**
 * ======================
 * EDIT EMPLOYEE
 * ======================
 */
exports.editEmp = async (
  id,
  name,
  email,
  contact,
  join_date,
  role,
  designation,
  salary
) => {

  const sql = `
  UPDATE employee
  SET
    name = ?,
    email = ?,
    contact = ?,
    join_date = ?,
    role = ?,
    designation = ?,
    salary = ?
  WHERE id = ?
  `;

  const [result] = await db.query(sql, [
    name,
    email,
    contact,
    join_date,
    role,
    designation,
    salary,
    id
  ]);

  return result;
};


/**
 * ======================
 * DELETE EMPLOYEE
 * ======================
 */
exports.deleteEmp = async (id) => {

  const sql = `DELETE FROM employee WHERE id = ?`;

  const [result] = await db.query(sql, [id]);

  return result;
};


/**
 * ======================
 * SEARCH EMPLOYEE
 * ======================
 */
exports.searchEmp = async (key) => {

  const sql = `
  SELECT *
  FROM employee
  WHERE name LIKE ?
  `;

  const [rows] = await db.query(sql, [`%${key}%`]);

  return rows;
};


/**
 * ======================
 * GET ALL EMPLOYEES
 * ======================
 */
exports.getAllemployee = async () => {

  const sql = `
  SELECT *
  FROM employee
  ORDER BY id DESC
  `;

  const [rows] = await db.query(sql);

  return rows;
};


/**
 * ======================
 * GET EMPLOYEE BY USER ID
 * ======================
 */
exports.getEmpByUserId = async (user_id) => {

  const sql = `
  SELECT *
  FROM employee
  WHERE user_id = ?
  `;

  const [rows] = await db.query(sql, [user_id]);

  return rows[0];
};