const db = require("../config/db");

/**
 * ADD HERO
 */
exports.addHero = async (data) => {
  const sql = `
    INSERT INTO hero_slides (title, highlight, description, image)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    data.title,
    data.highlight,
    data.description,
    data.image,
  ]);

  return result.insertId;
};

/**
 * GET ALL HERO (ORDER FIX)
 */
exports.getAllHero = async () => {
  const [rows] = await db.query(`
    SELECT * FROM hero_slides 
    ORDER BY id DESC
  `);
  return rows;
};

/**
 * GET SINGLE HERO
 */
exports.getHeroById = async (id) => {
  const [rows] = await db.query(
    `SELECT * FROM hero_slides WHERE id = ?`,
    [id]
  );
  return rows[0];
};

/**
 * UPDATE HERO
 */
exports.updateHero = async (id, data) => {
  const sql = `
    UPDATE hero_slides
    SET title=?, highlight=?, description=?, image=?
    WHERE id=?
  `;

  const [result] = await db.query(sql, [
    data.title,
    data.highlight,
    data.description,
    data.image,
    id,
  ]);

  return result;
};

/**
 * DELETE HERO
 */
exports.deleteHero = async (id) => {
  const [result] = await db.query(
    `DELETE FROM hero_slides WHERE id=?`,
    [id]
  );
  return result;
};