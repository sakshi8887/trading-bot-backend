const mongoose = require("mongoose");
const Order = require("../models/Order");
const Portfolio = require("../models/Portfolio");
const Trade = require("../models/Trade");

const placePaperOrder = async ({
  userId,
  symbol,
  side,
  quantity,
  price,
  stopLoss = null,
  takeProfit = null,
}) => {
  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      const portfolio = await Portfolio.findOne({
        user: userId,
      }).session(session);

      if (!portfolio) {
        throw new Error("Portfolio not found");
      }

      const totalValue = quantity * price;

      // =========================
      // BUY
      // =========================
      if (side === "BUY") {
        if (portfolio.balance < totalValue) {
          throw new Error("Insufficient paper balance");
        }

        const existingHolding = portfolio.holdings.find(
          (holding) => holding.symbol === symbol
        );

        if (existingHolding) {
          const oldValue =
            existingHolding.quantity * existingHolding.averagePrice;

          const newQuantity = existingHolding.quantity + quantity;

          existingHolding.averagePrice =
            (oldValue + totalValue) / newQuantity;

          existingHolding.quantity = newQuantity;
          existingHolding.currentPrice = price;
          existingHolding.unrealizedPnL =
            (price - existingHolding.averagePrice) * newQuantity;
        } else {
          portfolio.holdings.push({
            symbol,
            quantity,
            averagePrice: price,
            currentPrice: price,
            unrealizedPnL: 0,
          });
        }

        portfolio.balance -= totalValue;

        // Maintain one OPEN trade per symbol using weighted average entry.
        const openTrade = await Trade.findOne({
          user: userId,
          symbol,
          status: "OPEN",
        }).session(session);

        if (openTrade) {
          const oldTradeValue =
            openTrade.quantity * openTrade.entryPrice;

          const newTradeQuantity = openTrade.quantity + quantity;

          openTrade.entryPrice =
            (oldTradeValue + totalValue) / newTradeQuantity;

          openTrade.quantity = newTradeQuantity;

          await openTrade.save({ session });
        } else {
          const trade = new Trade({
            user: userId,
            symbol,
            side: "BUY",
            quantity,
            entryPrice: price,
            status: "OPEN",
            openedAt: new Date(),
          });

          await trade.save({ session });
        }
      }

      // =========================
      // SELL
      // =========================
      if (side === "SELL") {
        const existingHolding = portfolio.holdings.find(
          (holding) => holding.symbol === symbol
        );

        if (!existingHolding) {
          throw new Error("No holding available to sell");
        }

        if (existingHolding.quantity < quantity) {
          throw new Error("Insufficient holding quantity");
        }

        const openTrade = await Trade.findOne({
          user: userId,
          symbol,
          status: "OPEN",
        }).session(session);

        if (!openTrade) {
          throw new Error("No open trade available");
        }

        if (openTrade.quantity < quantity) {
          throw new Error("Trade quantity is inconsistent with portfolio");
        }

        const realizedPnL =
          (price - openTrade.entryPrice) * quantity;

        portfolio.realizedPnL += realizedPnL;
        portfolio.balance += totalValue;

        existingHolding.quantity -= quantity;
        existingHolding.currentPrice = price;

        if (existingHolding.quantity === 0) {
          portfolio.holdings = portfolio.holdings.filter(
            (holding) => holding.symbol !== symbol
          );
        } else {
          existingHolding.unrealizedPnL =
            (price - existingHolding.averagePrice) *
            existingHolding.quantity;
        }

        // Full close
        if (openTrade.quantity === quantity) {
          openTrade.exitPrice = price;
          openTrade.profitLoss = realizedPnL;
          openTrade.status = "CLOSED";
          openTrade.closedAt = new Date();

          await openTrade.save({ session });
        }

        // Partial close
        else {
          openTrade.quantity -= quantity;

          await openTrade.save({ session });

          const closedTrade = new Trade({
            user: userId,
            symbol,
            side: "SELL",
            quantity,
            entryPrice: openTrade.entryPrice,
            exitPrice: price,
            profitLoss: realizedPnL,
            status: "CLOSED",
            openedAt: new Date(),
            closedAt: new Date(),
          });

          await closedTrade.save({ session });
        }
      }

      // Recalculate total P&L
      const unrealizedPnL = portfolio.holdings.reduce(
        (total, holding) => total + holding.unrealizedPnL,
        0
      );

      portfolio.totalPnL =
        portfolio.realizedPnL + unrealizedPnL;

      await portfolio.save({ session });

      // Save order
      const order = new Order({
        user: userId,
        symbol,
        side,
        orderType: "MARKET",
        quantity,
        requestedPrice: price,
        executedPrice: price,
        status: "FILLED",
        stopLoss,
        takeProfit,
        executedAt: new Date(),
      });

      await order.save({ session });

      createdOrder = order;
    });

    return createdOrder;
  } finally {
    await session.endSession();
  }
};

const getPaperOrders = async (userId) => {
  return await Order.find({ user: userId })
    .sort({ executedAt: -1 })
    .limit(50);
};

module.exports = {
  placePaperOrder,
  getPaperOrders,
};