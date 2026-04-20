const db = require("../config/db");

/**
 * ======================
 * ADD DEPARTMENT / SECTION
 * ======================
 */
exports.addDepartment = async (data) => {
  const sql = `
    INSERT INTO department (department_name, department_desc, section)
    VALUES (?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    data.department_name,
    data.department_desc,
    data.section || null, // 🔥 important
  ]);

  return result.insertId;
};

/**
 * ======================
 * GET ALL DEPARTMENTS ONLY
 * ======================
 */
exports.getAllDepartments = async () => {
  const [rows] = await db.query(`
    SELECT * FROM department 
    WHERE section IS NULL
    ORDER BY id DESC
  `);

  return rows;
};

/**
 * ======================
 * GET SINGLE DEPARTMENT
 * ======================
 */
exports.getDepartmentById = async (id) => {
  const [rows] = await db.query(
    `SELECT * FROM department WHERE id = ?`,
    [id]
  );

  return rows[0];
};

/**
 * ======================
 * UPDATE
 * ======================
 */
exports.updateDepartment = async (id, data) => {
  const [result] = await db.query(
    `UPDATE department 
     SET department_name = ?, department_desc = ?, section = ?
     WHERE id = ?`,
    [
      data.department_name,
      data.department_desc,
      data.section || null,
      id,
    ]
  );

  return result;
};

/**
 * ======================
 * DELETE
 * ======================
 */
exports.deleteDepartment = async (id) => {
  const [result] = await db.query(
    `DELETE FROM department WHERE id = ?`,
    [id]
  );

  return result;
};

/**
 * ======================
 * 🔥 SAVE SECTION
 * ======================
 */
exports.saveSection = async (key, data) => {
  const { title, description } = data;

  const [existing] = await db.query(
    "SELECT * FROM department WHERE section = ?",
    [key]
  );

  if (existing.length > 0) {
    // update
    await db.query(
      `UPDATE department 
       SET department_name = ?, department_desc = ?
       WHERE section = ?`,
      [title, description, key]
    );
  } else {
    // insert
    await db.query(
      `INSERT INTO department (department_name, department_desc, section)
       VALUES (?, ?, ?)`,
      [title, description, key]
    );
  }

  return true;
};

/**
 * ======================
 * GET SECTION
 * ======================
 */
exports.getSection = async (key) => {
  const [rows] = await db.query(
    "SELECT * FROM department WHERE section = ?",
    [key]
  );

  return rows[0];
};

/**
 * ======================
 * DELETE SECTION
 * ======================
 */
exports.deleteSection = async (key) => {
  await db.query(
    "DELETE FROM department WHERE section = ?",
    [key]
  );

  return true;
};

/**
 * ======================
 * 🔥 HOME API (ALL DATA)
 * ======================
 */
exports.getHomeData = async () => {
  const [departments] = await db.query(
    "SELECT * FROM department WHERE section IS NULL ORDER BY id DESC"
  );

  const [sections] = await db.query(
    "SELECT * FROM department WHERE section IS NOT NULL"
  );

  const sectionData = {};
  sections.forEach((item) => {
    sectionData[item.section] = item;
  });

  return {
    departments,
    sections: sectionData,
  };
};