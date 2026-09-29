const { placePaperOrder, getPaperOrders} = require("../services/orderService");

const createPaperOrder = async (req, res) => {
  try {
    const {
      symbol,
      side,
      quantity,
      price,
      stopLoss,
      takeProfit,
    } = req.body;

    if (!symbol || !side || !quantity || !price) {
      return res.status(400).json({
        message: "Symbol, side, quantity and price are required",
      });
    }

    const normalizedSide = side.toUpperCase();

    if (!["BUY", "SELL"].includes(normalizedSide)) {
      return res.status(400).json({
        message: "Side must be BUY or SELL",
      });
    }

    if (quantity <= 0 || price <= 0) {
      return res.status(400).json({
        message: "Quantity and price must be greater than 0",
      });
    }

    const order = await placePaperOrder({
      userId: req.user._id,
      symbol: symbol.toUpperCase(),
      side: normalizedSide,
      quantity: Number(quantity),
      price: Number(price),
      stopLoss: stopLoss ? Number(stopLoss) : null,
      takeProfit: takeProfit ? Number(takeProfit) : null,
    });

    res.status(201).json({
      message: "Paper order executed successfully",
      order,
    });
  } catch (error) {
    console.error("Paper order error:", error.message);

    res.status(400).json({
      message: error.message,
    });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const orders = await getPaperOrders(req.user._id);

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("Order history error:", error.message);

    res.status(500).json({
      message: "Failed to fetch order history",
    });
  }
};

module.exports = {
  createPaperOrder,
  getOrderHistory,
};