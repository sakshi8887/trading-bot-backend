const WebSocket = require("ws");

const BINANCE_WS_URL =
  "wss://stream.binance.com:9443/ws/btcusdt@kline_1m";

let socket = null;
let reconnectTimer = null;

const startMarketDataStream = (io) => {
  if (socket) {
    console.log("Market data stream is already running");
    return;
  }

  console.log("Connecting to Binance market data...");

  socket = new WebSocket(BINANCE_WS_URL);

  socket.on("open", () => {
    console.log("Binance market data connected");
  });

  socket.on("message", (rawData) => {
    try {
      const message = JSON.parse(rawData.toString());

      if (message.e !== "kline") {
        return;
      }

      const kline = message.k;

      const marketData = {
        symbol: message.s,
        interval: kline.i,
        open: Number(kline.o),
        high: Number(kline.h),
        low: Number(kline.l),
        close: Number(kline.c),
        volume: Number(kline.v),
        isClosed: kline.x,
        openTime: kline.t,
        eventTime: message.E,
      };

      console.log("Live Market Data:", marketData);
      io.emit("marketData", marketData);
    } catch (error) {
      console.error(
        "Market data parsing error:",
        error.message
      );
    }
  });

  socket.on("error", (error) => {
    console.error(
      "Binance WebSocket error:",
      error.message
    );
  });

  socket.on("close", () => {
    console.log("Binance market data disconnected");

    socket = null;

    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        startMarketDataStream(io);
      }, 5000);
    }
  });
};

const getHistoricalKlines = async (
  symbol = "BTCUSDT",
  interval = "1m",
  limit = 200
) => {
  const url =
    `https://data-api.binance.vision/api/v3/klines` +
    `?symbol=${symbol}` +
    `&interval=${interval}` +
    `&limit=${limit}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch historical candles: ${response.status}`
    );
  }

  const data = await response.json();

  return data.map((candle) => ({
    time: Math.floor(candle[0] / 1000),
    open: Number(candle[1]),
    high: Number(candle[2]),
    low: Number(candle[3]),
    close: Number(candle[4]),
    volume: Number(candle[5]),
  }));
};

module.exports = {
  startMarketDataStream,
  getHistoricalKlines,
};