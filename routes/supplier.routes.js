const router = require("express").Router();
const ctrl = require("../controller/supplier.controller");

router.post("/supplier", ctrl.add);
router.get("/supplier", ctrl.getAll);
router.put("/supplier/:id", ctrl.update);
router.delete("/supplier/:id", ctrl.delete);

module.exports = router;