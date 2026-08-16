const express = require("express");
const app = express();
const connectDb = require("./src/config/database");

// Connect to MongoDB
connectDb();

const authRoutes = require("./src/modules/auth/auth.routes");
const productRoutes = require("./src/modules/products/product.routes");
const cartRoutes = require("./src/modules/cart/cart.routes");
const orderRoutes = require("./src/modules/order/order.routes");

const globalErrorHandler = require("./src/middleware/error.middleware");

// Allow the configured frontend to call this API from a browser.
// Multiple deployed frontends can be supplied as a comma-separated FRONTEND_URL.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;

