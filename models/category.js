const db = require("../config/db");

exports.add = async (name) => {
  const [res] = await db.query(
    "INSERT INTO medicine_category (name) VALUES (?)",
    [name]
  );
  return res.insertId;
};

exports.getAll = async () => {
  const [rows] = await db.query(
    "SELECT * FROM medicine_category ORDER BY id DESC"
  );
  return rows;
};

exports.update = async (id, name) => {
  await db.query(
    "UPDATE medicine_category SET name=? WHERE id=?",
    [name, id]
  );
};

exports.delete = async (id) => {
  await db.query(
    "DELETE FROM medicine_category WHERE id=?",
    [id]
  );
};