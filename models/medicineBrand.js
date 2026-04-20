const db = require("../config/db");

exports.addBrand = async (name) => {
  const sql = `INSERT INTO medicine_brand (name) VALUES (?)`;
  const [result] = await db.query(sql, [name]);
  return result.insertId;
};

exports.getBrands = async () => {
  const [rows] = await db.query(
    "SELECT * FROM medicine_brand ORDER BY id DESC"
  );
  return rows;
};

/**
 * ======================
 * UPDATE BRAND
 * ======================
 */
exports.updateBrand = async (id, name) => {
  const sql = `UPDATE medicine_brand SET name = ? WHERE id = ?`;
  const [result] = await db.query(sql, [name, id]);
  return result;
};

/**
 * ======================
 * DELETE BRAND
 * ======================
 */
exports.deleteBrand = async (id) => {
  const sql = `DELETE FROM medicine_brand WHERE id = ?`;
  const [result] = await db.query(sql, [id]);
  return result;
};