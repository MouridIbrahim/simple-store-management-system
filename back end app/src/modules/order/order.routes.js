const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { authenticate, authorize } = require("../auth/auth.middleware");

router.use(authenticate); // Require authentication for all order routes

router.post("/", orderController.createOrder);
router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrderById);
router.post("/:id/cancel", orderController.cancelOrder);

// Admin-only route to update status
router.put("/:id/status", authorize("admin"), orderController.updateOrderStatus);

module.exports = router;
