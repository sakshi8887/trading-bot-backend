const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const marketRoutes = require("./routes/marketRoutes");
const strategyRoutes = require("./routes/strategyRoutes");
require("dotenv").config();

const connectDB = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const orderRoutes = require("./routes/orderRoutes");
const tradeRoutes = require("./routes/tradeRoutes");

const {
  startMarketDataStream,
} = require("./services/marketDataService");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/strategy", strategyRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Trading Bot API is running",
  });
});

io.on("connection", (socket) => {
  console.log("Frontend connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Frontend disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

    startMarketDataStream(io);
  });
};

startServer();