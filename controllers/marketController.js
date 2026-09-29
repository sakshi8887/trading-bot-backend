const BINANCE_DATA_API =
  "https://data-api.binance.vision";

const allowedIntervals = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
];

const getHistoricalKlines = async (req, res) => {
  try {
    const symbol = (
      req.query.symbol || "BTCUSDT"
    ).toUpperCase();

    const interval = req.query.interval || "1m";

    const limit = Math.min(
      Number(req.query.limit) || 200,
      500
    );

    if (!allowedIntervals.includes(interval)) {
      return res.status(400).json({
        message: "Invalid interval",
      });
    }

    const url =
      `${BINANCE_DATA_API}/api/v3/klines` +
      `?symbol=${symbol}` +
      `&interval=${interval}` +
      `&limit=${limit}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.text();

      return res.status(response.status).json({
        message: "Binance market data request failed",
        error: errorData,
      });
    }

    const data = await response.json();

    const candles = data.map((candle) => ({
      time: Math.floor(candle[0] / 1000),
      open: Number(candle[1]),
      high: Number(candle[2]),
      low: Number(candle[3]),
      close: Number(candle[4]),
      volume: Number(candle[5]),
    }));

    res.status(200).json({
      symbol,
      interval,
      candles,
    });
  } catch (error) {
    console.error(
      "Historical market data error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to fetch historical market data",
    });
  }
};

module.exports = {
  getHistoricalKlines,
};