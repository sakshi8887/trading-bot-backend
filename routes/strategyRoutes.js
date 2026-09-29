const express = require("express");

const {
  getCurrentStrategySignal,
} = require("../controllers/strategyController");

const router = express.Router();

router.get("/signal", getCurrentStrategySignal);

module.exports = router;