const db = require("../config/db");

exports.add = async (name) => {
  const [res] = await db.query(
    "INSERT INTO dosage_form (name) VALUES (?)",
    [name]
  );
  return res.insertId;
};

exports.getAll = async () => {
  const [rows] = await db.query(
    "SELECT * FROM dosage_form ORDER BY id DESC"
  );
  return rows;
};

exports.update = async (id, name) => {
  await db.query(
    "UPDATE dosage_form SET name=? WHERE id=?",
    [name, id]
  );
};

exports.delete = async (id) => {
  await db.query(
    "DELETE FROM dosage_form WHERE id=?",
    [id]
  );
};