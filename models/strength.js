const db = require("../config/db");

exports.add = async (name) => {
  const [res] = await db.query(
    "INSERT INTO medicine_strength (name) VALUES (?)",
    [name]
  );
  return res.insertId;
};

exports.getAll = async () => {
  const [rows] = await db.query(
    "SELECT * FROM medicine_strength ORDER BY id DESC"
  );
  return rows;
};

exports.update = async (id, name) => {
  await db.query(
    "UPDATE medicine_strength SET name=? WHERE id=?",
    [name, id]
  );
};

exports.delete = async (id) => {
  await db.query(
    "DELETE FROM medicine_strength WHERE id=?",
    [id]
  );
};