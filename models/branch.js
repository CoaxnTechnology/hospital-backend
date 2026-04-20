const db = require("../config/db");

/* ======================
   GET ALL
====================== */
exports.getAllBranches = async () => {
  const [rows] = await db.query("SELECT * FROM branches ORDER BY id DESC");
  return rows;
};

/* ======================
   GET BY ID
====================== */
exports.getBranchById = async (id) => {
  const [rows] = await db.query("SELECT * FROM branches WHERE id = ?", [id]);
  return rows[0];
};

/* ======================
   CREATE
====================== */
exports.createBranch = async (data) => {
  const { name, address, city, area, phone } = data;

  const [result] = await db.query(
    "INSERT INTO branches (name,address,city,area,phone) VALUES (?,?,?,?,?)",
    [name, address, city, area, phone],
  );

  return result.insertId;
};

/* ======================
   UPDATE
====================== */
exports.updateBranch = async (id, data) => {
  const { name, address, city, area, phone } = data;

  await db.query(
    "UPDATE branches SET name=?,address=?,city=?,area=?,phone=? WHERE id=?",
    [name, address, city, area, phone, id]
  );
};

/* ======================
   DELETE
====================== */
exports.deleteBranch = async (id) => {
  await db.query("DELETE FROM branches WHERE id=?", [id]);
};
