const express = require("express");
const router = express.Router();

const { contact } = require("../controller/contact.controller");

router.post("/", contact);

module.exports = router;