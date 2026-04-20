const con = require("../config/db");
const { sellMedicine } = require("./medicine");
const createSale = async (data) => {
  const sql = `
  INSERT INTO sales
  (invoice_number,patient_id,doctor_name,prescription_no,subtotal,gst,discount,total,notes)
  VALUES (?,?,?,?,?,?,?,?,?)
  `;

  const [result] = await con.query(sql, [
    data.invoice_number,
    data.patient_id,
    data.doctor_name,
    data.prescription_no,
    data.subtotal,
    data.gst,
    data.discount,
    data.total,
    data.notes,
  ]);

  return result.insertId;
};
const addSaleItem = async (data) => {
  const sql = `
INSERT INTO sale_items
(sale_id,medicine_id,qty,price,total)
VALUES (?,?,?,?,?)
`;

  await con.query(sql, [
    data.sale_id,
    data.medicine_id,
    data.qty,
    data.price,
    data.total,
  ]);
};
const processSale = async (data) => {
  const { patient_id, doctor_name, prescription_no, items, discount, notes } =
    data;

  /* Generate Invoice Number */
  const invoice_number = `MED-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

  /* subtotal */
  let subtotal = 0;

  items.forEach((item) => {
    subtotal += item.price * item.qty;
  });

  /* GST */
  const gst = subtotal * 0.05;

  /* total */
  const total = subtotal + gst - discount;

  /* create sale */

  const saleId = await createSale({
    invoice_number,
    patient_id,
    doctor_name,
    prescription_no,
    subtotal,
    gst,
    discount,
    total,
    notes,
  });

  /* insert items + reduce stock */

  for (const item of items) {
    await addSaleItem({
      sale_id: saleId,
      medicine_id: item.id,
      qty: item.qty,
      price: item.price,
      total: item.price * item.qty,
    });

    await sellMedicine(item.id, item.qty);
  }

  return {
    sale_id: saleId,
    invoice_number,
    subtotal,
    gst,
    total,
  };
};
const getSaleByInvoice = async (invoice) => {

  const sql = `
  SELECT 
    si.medicine_id,
    m.name,
    si.qty,
    si.price
  FROM sales s
  JOIN sale_items si ON s.id = si.sale_id
  JOIN medicine m ON m.id = si.medicine_id
  WHERE s.invoice_number = ?
  `;

  const [rows] = await con.query(sql,[invoice]);

  return rows;
};
module.exports = {
  processSale,
  createSale,
  addSaleItem,
  getSaleByInvoice,
};
