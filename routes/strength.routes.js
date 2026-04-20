const router = require("express").Router();
const ctrl = require("../controller/strength.controller");

router.post("/strength", ctrl.add);
router.get("/strength", ctrl.getAll);
router.put("/strength/:id", ctrl.update);
router.delete("/strength/:id", ctrl.delete);

module.exports = router;