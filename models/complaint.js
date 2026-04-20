const db = require("../config/db");

/**
 * POST COMPLAIN
 */
exports.postComplain = async (message, name, email, subject) => {

  const sql = `
  INSERT INTO complain
  (message, name, email, subject)
  VALUES (?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    message,
    name,
    email,
    subject
  ]);

  return result.insertId;
};


/**
 * GET ALL COMPLAINS
 */
exports.getComplains = async () => {

  const sql = `
  SELECT *
  FROM complain
  ORDER BY id DESC
  `;

  const [rows] = await db.query(sql);

  return rows;
};