const express = require("express");
const router = express.Router();

const sellController = require("../controller/sales.controller");
const { verifyToken, allowRoles } = require("../middlewares/auth.middleware");

/* CREATE SALE / BILL */

router.post(
"/",
verifyToken,
allowRoles("admin","staff","doctor"),
sellController.createSale
);
router.get("/invoice/:invoice",sellController.getSaleByInvoice);
router.get("/patient/:id", sellController.getSalesByPatient);
module.exports = router;