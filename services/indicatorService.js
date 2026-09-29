const calculateEMA = (prices, period) => {
    if (prices.length < period) {
      return [];
    }
  
    const multiplier = 2 / (period + 1);
  
    const firstPeriodPrices = prices.slice(0, period);
  
    const firstSMA =
      firstPeriodPrices.reduce(
        (sum, price) => sum + price,
        0
      ) / period;
  
    const emaValues = [
      {
        index: period - 1,
        value: firstSMA,
      },
    ];
  
    let previousEMA = firstSMA;
  
    for (let i = period; i < prices.length; i++) {
      const currentEMA =
        (prices[i] - previousEMA) * multiplier +
        previousEMA;
  
      emaValues.push({
        index: i,
        value: currentEMA,
      });
  
      previousEMA = currentEMA;
    }
  
    return emaValues;
  };
  
  const calculateRSI = (prices, period = 14) => {
    if (prices.length <= period) {
      return [];
    }
  
    let gains = 0;
    let losses = 0;
  
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
  
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
  
    let averageGain = gains / period;
    let averageLoss = losses / period;
  
    const rsiValues = [];
  
    const calculateCurrentRSI = () => {
      if (averageLoss === 0) {
        return 100;
      }
  
      const relativeStrength =
        averageGain / averageLoss;
  
      return 100 - 100 / (1 + relativeStrength);
    };
  
    rsiValues.push({
      index: period,
      value: calculateCurrentRSI(),
    });
  
    for (
      let i = period + 1;
      i < prices.length;
      i++
    ) {
      const change = prices[i] - prices[i - 1];
  
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
  
      averageGain =
        (averageGain * (period - 1) + gain) /
        period;
  
      averageLoss =
        (averageLoss * (period - 1) + loss) /
        period;
  
      rsiValues.push({
        index: i,
        value: calculateCurrentRSI(),
      });
    }
  
    return rsiValues;
  };
  
  module.exports = {
    calculateEMA,
    calculateRSI,
  };