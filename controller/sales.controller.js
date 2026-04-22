const Medicine = require("../models/medicine");
const Sales = require("../models/sales");
exports.createSale = async (req, res) => {
  try {
    const result = await Sales.processSale(req.body);

    res.json({
      success: true,
      invoice_number: result.invoice_number, // 👈 yaha se lo
      data: result,
    });
  } catch (err) {
    console.error(err);

    res.status(400).json({
      success: false,
      message: err.message || "Sale failed",
    });
  }
};
exports.getSaleByInvoice = async (req, res) => {
  try {
    const invoice = req.params.invoice;

    const items = await Sales.getSaleByInvoice(invoice);

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};
