const Portfolio = require("../models/Portfolio");

const getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({
      user: req.user._id,
    });

    if (!portfolio) {
      portfolio = await Portfolio.create({
        user: req.user._id,
      });
    }

    res.status(200).json({
      portfolio,
    });
  } catch (error) {
    console.error("Get portfolio error:", error.message);

    res.status(500).json({
      message: "Unable to fetch portfolio",
    });
  }
};

module.exports = {
  getPortfolio,
};