const {
    getHistoricalKlines,
  } = require("../services/marketDataService");
  
  const {
    generateSignal,
  } = require("../services/strategyService");
  
  const getCurrentStrategySignal = async (req, res) => {
    try {
      const candles = await getHistoricalKlines(
        "BTCUSDT",
        "1m",
        200
      );
  
      const result = generateSignal(candles);
  
      res.status(200).json({
        symbol: "BTCUSDT",
        interval: "1m",
        candleCount: candles.length,
        ...result,
      });
    } catch (error) {
      console.error(
        "Strategy signal error:",
        error.message
      );
  
      res.status(500).json({
        message: "Unable to generate strategy signal",
      });
    }
  };
  
  module.exports = {
    getCurrentStrategySignal,
  };