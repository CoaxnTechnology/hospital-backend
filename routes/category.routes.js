const router = require("express").Router();
const ctrl = require("../controller/category.controller");

router.post("/category", ctrl.add);
router.get("/category", ctrl.getAll);
router.put("/category/:id", ctrl.update);
router.delete("/category/:id", ctrl.delete);

module.exports = router;