const con = require("../config/db");
const { sellMedicine } = require("./medicine");
const Prescription = require("./prescription");

/* ======================
   CREATE SALE
====================== */
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

/* ======================
   ADD SALE ITEM
====================== */
const addSaleItem = async (data) => {
  const sql = `
  INSERT INTO sale_items
  (sale_id,medicine_id,qty,price,gst,total)
  VALUES (?,?,?,?,?,?)
  `;

  await con.query(sql, [
    data.sale_id,
    data.medicine_id,
    data.qty,
    data.price,
    data.gst,
    data.total,
  ]);
};

/* ======================
   PROCESS SALE (FINAL)
====================== */
const processSale = async (data) => {
  console.log("🚀 REQUEST DATA:", data);

  const connection = await con.getConnection();

  try {
    await connection.beginTransaction();
    console.log("✅ Transaction started");

    const { prescription_no, discount = 0, notes, items } = data;

    console.log("📦 ITEMS FROM FRONTEND:", items);

    if (!items || items.length === 0) {
      console.log("❌ No items received");
      throw new Error("No items provided");
    }

    const prescriptionData =
      await Prescription.getFullPrescription(prescription_no);

    console.log("📄 PRESCRIPTION DATA:", prescriptionData);

    if (!prescriptionData.length) {
      console.log("❌ Prescription not found");
      throw new Error("Prescription not found");
    }

    const patient_id = prescriptionData[0].patient_id;
    const doctor_name = prescriptionData[0].doctor_name;

    console.log("👤 PATIENT:", patient_id);
    console.log("👨‍⚕️ DOCTOR:", doctor_name);

    const invoice_number = `MED-${new Date().getFullYear()}-${Date.now()
      .toString()
      .slice(-5)}`;

    console.log("🧾 INVOICE:", invoice_number);

    let subtotal = 0;
    let totalGst = 0;

    const processedItems = [];

    for (const item of items) {
      console.log("➡️ RAW ITEM:", item);

      const qty = Number(item.qty);
      const price = Number(item.price);
      const gstPercent = Number(item.gst || 0);

      console.log("➡️ Parsed:", { qty, price, gstPercent });

      const itemTotal = price * qty;
      const itemGst = (itemTotal * gstPercent) / 100;

      subtotal += itemTotal;
      totalGst += itemGst;

      processedItems.push({
        name: item.name,
        qty,
        price,
        gst: gstPercent,
        total: itemTotal + itemGst,
      });
    }

    console.log("📊 PROCESSED ITEMS:", processedItems);

    const total = subtotal + totalGst - discount;

    console.log("💰 TOTAL:", { subtotal, totalGst, total });

    const [saleResult] = await connection.query(
      `INSERT INTO sales
      (invoice_number,patient_id,doctor_name,prescription_no,subtotal,gst,discount,total,notes)
      VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        invoice_number,
        patient_id,
        doctor_name,
        prescription_no,
        subtotal,
        totalGst,
        discount,
        total,
        notes,
      ],
    );

    const saleId = saleResult.insertId;
    console.log("✅ SALE CREATED:", saleId);

    for (const item of processedItems) {
      console.log("🔍 FINDING MEDICINE:", item.name);

      const [stock] = await connection.query(
        "SELECT id, name, quantity FROM medicine WHERE LOWER(name) LIKE ?",
        [`%${item.name.toLowerCase()}%`],
      );

      console.log("📦 FOUND:", stock);

      if (!stock.length) {
        throw new Error(`Medicine not found: ${item.name}`);
      }

      const medId = stock[0].id;

      if (stock[0].quantity < item.qty) {
        throw new Error("Insufficient stock");
      }

      await connection.query(
        `INSERT INTO sale_items 
    (sale_id, medicine_id, qty, price, gst, total)
    VALUES (?,?,?,?,?,?)`,
        [saleId, medId, item.qty, item.price, item.gst, item.total],
      );

      await connection.query(
        `UPDATE medicine 
     SET quantity = quantity - ? 
     WHERE id = ?`,
        [item.qty, medId],
      );
    }
    await connection.commit();
    console.log("✅ TRANSACTION COMMITTED");

    return {
      sale_id: saleId,
      invoice_number,
      subtotal,
      gst: totalGst,
      total,
    };
  } catch (error) {
    console.log("🔥 ERROR OCCURRED:", error.message);
    await connection.rollback();
    console.log("❌ TRANSACTION ROLLBACK");
    throw error;
  } finally {
    connection.release();
    console.log("🔚 CONNECTION RELEASED");
  }
};

/* ======================
   GET SALE
====================== */
const getSaleByInvoice = async (invoice) => {
  const sql = `
  SELECT 
    si.medicine_id,
    m.name,
    si.qty,
    si.price,
    si.gst,
    si.total
  FROM sales s
  JOIN sale_items si ON s.id = si.sale_id
  JOIN medicine m ON m.id = si.medicine_id
  WHERE s.invoice_number = ?
  `;

  const [rows] = await con.query(sql, [invoice]);

  return rows;
};
const getSalesByPatient = async (patientId) => {
  const sql = `
  SELECT 
    s.id,
    s.invoice_number,
    s.total,
    s.created_at,

    pr.appointment_id   -- 🔥 IMPORTANT

  FROM sales s

  LEFT JOIN prescription pr 
    ON pr.id = s.prescription_no

  WHERE s.patient_id = ?

  ORDER BY s.id DESC
  `;

  const [rows] = await con.query(sql, [patientId]);

  return rows;
};
module.exports = {
  processSale,
  createSale,
  addSaleItem,
  getSaleByInvoice,
  getSalesByPatient,
};
