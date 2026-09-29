const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    side: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },

    orderType: {
      type: String,
      enum: ["MARKET", "LIMIT"],
      default: "MARKET",
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    requestedPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    executedPrice: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "FILLED", "CANCELLED", "REJECTED"],
      default: "PENDING",
    },

    stopLoss: {
      type: Number,
      default: null,
    },

    takeProfit: {
      type: Number,
      default: null,
    },

    executedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;