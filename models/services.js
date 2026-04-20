const db = require("../config/db");

/**
 * ADD SERVICE
 */
exports.addService = async (data) => {
  const sql = `
    INSERT INTO services (title, description, icon)
    VALUES (?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    data.title,
    data.description,
    data.icon,
  ]);

  return result.insertId;
};

/**
 * GET ALL SERVICES
 */
exports.getAllServices = async () => {
  const sql = `
    SELECT *
    FROM services
    ORDER BY id DESC
  `;

  const [rows] = await db.query(sql);
  return rows;
};

/**
 * GET SERVICE BY ID
 */
exports.getServiceById = async (id) => {
  const sql = `SELECT * FROM services WHERE id = ?`;
  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

/**
 * UPDATE SERVICE
 */
exports.updateService = async (id, data) => {
  const sql = `
    UPDATE services
    SET title = ?, description = ?, icon = ?
    WHERE id = ?
  `;

  const [result] = await db.query(sql, [
    data.title,
    data.description,
    data.icon,
    id,
  ]);

  return result;
};

/**
 * DELETE SERVICE
 */
exports.deleteService = async (id) => {
  const sql = `DELETE FROM services WHERE id = ?`;
  const [result] = await db.query(sql, [id]);
  return result;
};