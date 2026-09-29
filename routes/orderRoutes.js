const express = require("express");

const { createPaperOrder, getOrderHistory, } = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/paper", protect, createPaperOrder);
router.get("/paper", protect, getOrderHistory);

module.exports = router;