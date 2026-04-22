const con = require("../config/db");

/**
 * ======================
 * ADD MEDICINE
 * ======================
 */
const addMedicine = async (data) => {
  const sql = `
INSERT INTO medicine (
name,
generic_name,
brand_id,
category,
dosage_form,
strength,
manufacturer,
supplier,
quantity,
reorder_level,
unit,
unit_cost,
selling_price,
gst_percentage, // 👈 ADD
shelf_location,
batch_number,
manufacturing_date,
expiry_date,
barcode,
prescription_required,
description,
composition,
storage
)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`;

  await con.query(sql, [
    data.name,
    data.generic_name,
    data.brand_id,
    data.category,
    data.dosage_form,
    data.strength,
    data.manufacturer,
    data.supplier,
    data.quantity,
    data.reorder_level,
    data.unit,
    data.unit_cost,
    data.selling_price,
    data.gst_percentage, // 👈 ADD
    data.shelf_location,
    data.batch_number,
    data.manufacturing_date,
    data.expiry_date,
    data.barcode,
    data.prescription_required,
    data.description,
    data.composition,
    data.storage,
  ]);
};
/**
 * ======================
 * BULK INSERT (Excel Upload)
 * ======================
 */
/**
 * ======================
 * BULK INSERT (CSV / Excel)
 * ======================
 */
const bulkInsertMedicines = async (data) => {
  const sql = `
INSERT INTO medicine (
name,
generic_name,
brand_id,
category,
dosage_form,
strength,
manufacturer,
supplier,
quantity,
reorder_level,
unit,
unit_cost,
selling_price,
gst_percentage,   // 👈 ADD HERE
shelf_location,
batch_number,
manufacturing_date,
expiry_date,
barcode,
prescription_required,
description,
composition,
storage
)
VALUES ?
`;

  await con.query(sql, [data]);
};

/**
 * ======================
 * GET ALL MEDICINES
 * ======================
 */
const getAllMedicine = async () => {
  const sql = `SELECT * FROM medicine ORDER BY id DESC`;

  const [rows] = await con.query(sql);

  return rows;
};

/**
 * ======================
 * GET MEDICINE BY ID
 * ======================
 */
const getMedicineById = async (id) => {
  const sql = `SELECT * FROM medicine WHERE id = ?`;

  const [rows] = await con.query(sql, [id]);

  return rows[0];
};

/**
 * ======================
 * UPDATE MEDICINE
 * ======================
 */
const updateMedicine = async (id, data) => {
  const columnMap = {
    name: "name",
    generic_name: "generic_name",
    brand_id: "brand_id",
    category: "category",
    dosage_form: "dosage_form",
    strength: "strength",
    manufacturer: "manufacturer",
    supplier: "supplier",
    quantity: "quantity",
    reorder_level: "reorder_level",
    unit: "unit",
    unit_cost: "unit_cost",
    selling_price: "selling_price",
    gst_percentage: "gst_percentage", // 👈 ADD THIS
    shelf_location: "shelf_location",
    batch_number: "batch_number",
    manufacturing_date: "manufacturing_date",
    expiry_date: "expiry_date",
    barcode: "barcode",
    prescription_required: "prescription_required",
    description: "description",
    composition: "composition",
    storage: "storage",
  };

  const fields = [];
  const values = [];

  for (const key in data) {
    if (columnMap[key]) {
      fields.push(`${columnMap[key]} = ?`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) {
    throw new Error("No valid fields to update");
  }

  values.push(id);

  const sql = `
UPDATE medicine
SET ${fields.join(",")}
WHERE id = ?
`;

  await con.query(sql, values);
};

/**
 * ======================
 * DELETE MEDICINE
 * ======================
 */
const deleteMedicine = async (id) => {
  const sql = `DELETE FROM medicine WHERE id = ?`;

  await con.query(sql, [id]);
};

/**
 * ======================
 * SEARCH MEDICINE
 * ======================
 */
const searchMedicine = async (key) => {
  const sql = `
SELECT * FROM medicine
WHERE name LIKE ?
`;

  const [rows] = await con.query(sql, [`%${key}%`]);

  return rows;
};

/**
 * ======================
 * SELL MEDICINE
 * ======================
 */
const sellMedicine = async (id, quantity) => {
  const sql = `
  UPDATE medicine
  SET quantity = quantity - ?
  WHERE id = ? AND quantity >= ?
  `;

  const [result] = await con.query(sql, [quantity, id, quantity]);

  if (result.affectedRows === 0) {
    throw new Error("Insufficient stock");
  }

  return true;
};
/**
 * ======================
 * RETURN MEDICINE
 * ======================
 */
const returnMedicine = async (data) => {
  const { medicine_id, quantity, price, gst, refund_amount } = data;

  // 1️⃣ Save return history
  await con.query(
    `INSERT INTO medicine_returns 
    (medicine_id, quantity, price, gst, refund_amount)
     VALUES (?, ?, ?, ?, ?)`,
    [medicine_id, quantity, price, gst, refund_amount],
  );

  // 2️⃣ Increase stock
  await con.query(
    `UPDATE medicine
     SET quantity = quantity + ?
     WHERE id = ?`,
    [quantity, medicine_id],
  );
};

/**
 * ======================
 * LOW STOCK
 * ======================
 */
const getLowStock = async (limit = 10) => {
  const sql = `
SELECT * FROM medicine
WHERE quantity <= ?
ORDER BY quantity ASC
`;

  const [rows] = await con.query(sql, [limit]);

  return rows;
};

/**
 * ======================
 * EXPIRING SOON
 * ======================
 */
const getExpiringSoon = async (days = 30) => {
  const sql = `
SELECT * FROM medicine
WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
`;

  const [rows] = await con.query(sql, [days]);

  return rows;
};

/**
 * ======================
 * STOCK VALUE
 * ======================
 */
const getStockValue = async () => {
  const sql = `
SELECT SUM(selling_price * quantity) AS totalStockValue
FROM medicine
`;

  const [rows] = await con.query(sql);

  return rows[0];
};

module.exports = {
  addMedicine,
  bulkInsertMedicines,
  getAllMedicine,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  searchMedicine,
  sellMedicine,
  returnMedicine,
  getLowStock,
  getExpiringSoon,
  getStockValue,
  /* SALES */
};
