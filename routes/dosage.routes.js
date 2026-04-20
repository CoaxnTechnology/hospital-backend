const router = require("express").Router();
const ctrl = require("../controller/dosage.controller");

router.post("/dosage", ctrl.add);
router.get("/dosage", ctrl.getAll);
router.put("/dosage/:id", ctrl.update);
router.delete("/dosage/:id", ctrl.delete);

module.exports = router;