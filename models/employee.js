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
  salary,
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
    salary,
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
  salary,
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
    id,
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
exports.getEmployeesWithPagination = async (page, limit, search) => {
  console.log("👉 MODEL: page:", page, "limit:", limit, "search:", search);

  const offset = (page - 1) * limit;

  let sql = `
    SELECT *
    FROM employee
    WHERE 1
  `;

  let params = [];

  if (search) {
    sql += `
      AND (
        name LIKE ?
        OR email LIKE ?
        OR contact LIKE ?
        OR id = ?
      )
    `;

    params.push(
      `%${search}%`, // name
      `%${search}%`, // email
      `%${search}%`, // ✅ correct, // contact (starts with)
      Number(search) || 0, // id exact
    );
  }

  sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  console.log("👉 SQL:", sql);
  console.log("👉 PARAMS:", params);

  const [rows] = await db.query(sql, params);

  // 👉 COUNT QUERY
  let countSql = `SELECT COUNT(*) as total FROM employee WHERE 1`;
  let countParams = [];

  if (search) {
    countSql += `
      AND (
        name LIKE ?
        OR email LIKE ?
        OR contact LIKE ?
        OR id = ?
      )
    `;

    countParams.push(
      `%${search}%`,
      `%${search}%`,
      `${search}%`,
      Number(search) || 0,
    );
  }

  const [countResult] = await db.query(countSql, countParams);

  return {
    data: rows,
    total: countResult[0].total,
  };
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
