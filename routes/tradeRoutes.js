const express = require("express");

const { getTrades } = require("../controllers/tradeController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getTrades);

module.exports = router;