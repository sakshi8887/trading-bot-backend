const mongoose = require("mongoose");

const strategySettingsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "EMA_RSI",
      trim: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    shortEmaPeriod: {
      type: Number,
      default: 9,
      min: 1,
    },

    longEmaPeriod: {
      type: Number,
      default: 21,
      min: 2,
    },

    rsiPeriod: {
      type: Number,
      default: 14,
      min: 2,
    },

    rsiBuyThreshold: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    rsiSellThreshold: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    stopLossPercent: {
      type: Number,
      default: 2,
      min: 0,
    },

    takeProfitPercent: {
      type: Number,
      default: 4,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const StrategySettings = mongoose.model(
  "StrategySettings",
  strategySettingsSchema
);

module.exports = StrategySettings;