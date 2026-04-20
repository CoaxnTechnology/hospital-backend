const db = require("../config/db");

/* ======================
   GET HOSPITAL
====================== */
exports.get = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM hospital LIMIT 1");
    return rows[0] || null;
  } catch (err) {
    console.error("❌ Hospital GET Error:", err);
    return null;
  }
};

/* ======================
   SAVE (CREATE / UPDATE)
====================== */
exports.save = async (data) => {
  try {
    const { name, address, phone, email, logo, instagram, facebook } = data;

    const [rows] = await db.query("SELECT id FROM hospital LIMIT 1");

    if (rows.length === 0) {
      await db.query(
        `INSERT INTO hospital 
        (name, address, phone, email, logo, instagram, facebook) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, address, phone, email, logo, instagram, facebook],
      );
    } else {
      await db.query(
        `UPDATE hospital 
         SET name=?, address=?, phone=?, email=?, logo=?, instagram=?, facebook=? 
         WHERE id=?`,
        [name, address, phone, email, logo, instagram, facebook, rows[0].id],
      );
    }
  } catch (err) {
    console.error("❌ Hospital SAVE Error:", err);
  }
};
