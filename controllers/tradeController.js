const Trade = require("../models/Trade");

const getTrades = async (req, res) => {
  try {
    const trades = await Trade.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: trades.length,
      trades,
    });
  } catch (error) {
    console.error("Get trades error:", error.message);

    res.status(500).json({
      message: "Unable to fetch trade history",
    });
  }
};

module.exports = {
  getTrades,
};