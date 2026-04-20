const db = require("../config/db");

/**
 * ADD BLOG
 */
exports.addBlog = async (data) => {
  const sql = `
    INSERT INTO blogs (title, description, content, image, author)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    data.title,
    data.description,
    data.content,
    data.image,
    data.author,
  ]);

  return result.insertId;
};

/**
 * GET ALL BLOGS
 */
exports.getAllBlogs = async () => {
  const sql = `
    SELECT *
    FROM blogs
    ORDER BY id DESC
  `;

  const [rows] = await db.query(sql);
  return rows;
};

/**
 * GET BLOG BY ID
 */
exports.getBlogById = async (id) => {
  const sql = `SELECT * FROM blogs WHERE id = ?`;
  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

/**
 * UPDATE BLOG
 */
exports.updateBlog = async (id, data) => {
  const sql = `
    UPDATE blogs
    SET title = ?, description = ?, content = ?, image = ?, author = ?
    WHERE id = ?
  `;

  const [result] = await db.query(sql, [
    data.title,
    data.description,
    data.content,
    data.image,
    data.author,
    id,
  ]);

  return result;
};

/**
 * DELETE BLOG
 */
exports.deleteBlog = async (id) => {
  const sql = `DELETE FROM blogs WHERE id = ?`;
  const [result] = await db.query(sql, [id]);
  return result;
};