const {
    calculateEMA,
    calculateRSI,
  } = require("./indicatorService");
  
  const generateSignal = (candles) => {
    if (!candles || candles.length < 30) {
      return {
        signal: "HOLD",
        reason: "Not enough candle data",
      };
    }
  
    const closes = candles.map((candle) =>
      Number(candle.close)
    );
  
    const ema9 = calculateEMA(closes, 9);
    const ema21 = calculateEMA(closes, 21);
    const rsi14 = calculateRSI(closes, 14);
  
    if (
      ema9.length === 0 ||
      ema21.length === 0 ||
      rsi14.length === 0
    ) {
      return {
        signal: "HOLD",
        reason: "Indicators not available",
      };
    }
  
    const currentEMA9 =
      ema9[ema9.length - 1].value;
  
    const previousEMA9 =
      ema9[ema9.length - 2]?.value;
  
    const currentEMA21 =
      ema21[ema21.length - 1].value;
  
    const previousEMA21 =
      ema21[ema21.length - 2]?.value;
  
    const currentRSI =
      rsi14[rsi14.length - 1].value;
  
    const bullishCrossover =
      previousEMA9 <= previousEMA21 &&
      currentEMA9 > currentEMA21;
  
    const bearishCrossover =
      previousEMA9 >= previousEMA21 &&
      currentEMA9 < currentEMA21;
  
    if (bullishCrossover && currentRSI > 50) {
      return {
        signal: "BUY",
        reason: "Bullish EMA crossover with RSI confirmation",
        ema9: currentEMA9,
        ema21: currentEMA21,
        rsi: currentRSI,
      };
    }
  
    if (bearishCrossover && currentRSI < 50) {
      return {
        signal: "SELL",
        reason: "Bearish EMA crossover with RSI confirmation",
        ema9: currentEMA9,
        ema21: currentEMA21,
        rsi: currentRSI,
      };
    }
  
    return {
      signal: "HOLD",
      reason: "No valid trading signal",
      ema9: currentEMA9,
      ema21: currentEMA21,
      rsi: currentRSI,
    };
  };
  
  module.exports = {
    generateSignal,
  };