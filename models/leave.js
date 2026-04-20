const db = require("../config/db");

/**
 * CREATE LEAVE
 */
exports.createLeave = async (data) => {

  const sql = `
  INSERT INTO employee_leave
  (user_id, leave_type, date_from, date_to, total_days, reason)
  VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    data.user_id,
    data.leave_type,
    data.date_from,
    data.date_to,
    data.total_days,
    data.reason
  ]);

  return result;
};


/**
 * GET MY LEAVES
 */
exports.getLeavesByUser = async (user_id) => {

  const sql = `
  SELECT *
  FROM employee_leave
  WHERE user_id = ?
  ORDER BY created_at DESC
  `;

  const [rows] = await db.query(sql, [user_id]);

  return rows;
};


/**
 * ADMIN → ALL LEAVES
 */
exports.getAllLeaves = async () => {

  const sql = `
  SELECT 
    el.*,
    u.username,
    u.email,
    u.role
  FROM employee_leave el
  JOIN users u ON u.id = el.user_id
  ORDER BY el.created_at DESC
  `;

  const [rows] = await db.query(sql);

  return rows;
};


/**
 * UPDATE STATUS
 */
exports.updateLeaveStatus = async (id, status, admin_remark) => {

  const sql = `
  UPDATE employee_leave
  SET status = ?, admin_remark = ?
  WHERE id = ?
  `;

  const [result] = await db.query(sql, [status, admin_remark, id]);

  return result;
};
// models/leave.js

/**
 * GET PENDING LEAVE COUNT
 */
// models/leave.js

exports.getPendingLeaveCount = async () => {
  const sql = `
    SELECT COUNT(*) as total
    FROM employee_leave
    WHERE status = 'Pending' AND is_seen = 0
  `;

  const [rows] = await db.query(sql);
  return rows[0].total;
};
exports.markAllAsSeen = async () => {
  const sql = `
    UPDATE employee_leave
    SET is_seen = 1
    WHERE is_seen = 0
  `;

  await db.query(sql);
};