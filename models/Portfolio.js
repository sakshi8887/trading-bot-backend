const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    averagePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currentPrice: {
      type: Number,
      default: 0,
    },

    unrealizedPnL: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    balance: {
      type: Number,
      required: true,
      default: 100000,
      min: 0,
    },

    holdings: {
      type: [holdingSchema],
      default: [],
    },

    realizedPnL: {
      type: Number,
      default: 0,
    },

    totalPnL: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

module.exports = Portfolio;