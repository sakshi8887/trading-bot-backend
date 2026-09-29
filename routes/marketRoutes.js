const express = require("express");

const {
  getHistoricalKlines,
} = require("../controllers/marketController");

const router = express.Router();

router.get("/klines", getHistoricalKlines);

module.exports = router;