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

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;

