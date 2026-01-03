const express = require("express");
const router = express.Router();
const { analyzeInput } = require("../controllers/analyzeController");

router.post("/", analyzeInput);

module.exports = router;