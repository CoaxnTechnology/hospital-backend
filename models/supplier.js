const db = require("../config/db");

exports.add = async (data) => {
  const { name, phone, email, address } = data;

  const [res] = await db.query(
    `INSERT INTO supplier (name, phone, email, address)
     VALUES (?, ?, ?, ?)`,
    [name, phone, email, address]
  );

  return res.insertId;
};

exports.getAll = async () => {
  const [rows] = await db.query(
    "SELECT * FROM supplier ORDER BY id DESC"
  );
  return rows;
};

exports.update = async (id, data) => {
  const { name, phone, email, address } = data;

  await db.query(
    `UPDATE supplier 
     SET name=?, phone=?, email=?, address=? 
     WHERE id=?`,
    [name, phone, email, address, id]
  );
};

exports.delete = async (id) => {
  await db.query("DELETE FROM supplier WHERE id=?", [id]);
};