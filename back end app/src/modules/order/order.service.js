const Order = require("./order.model");
const Cart = require("../cart/cart.model");
const Product = require("../products/product.model");
const AppError = require("../../utils/appError");

const createOrder = async (userId, shippingAddress, paymentMethod) => {
  if (!shippingAddress) {
    throw new AppError("Shipping address is required", 400);
  }

  // Get user's cart
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new AppError("Your cart is empty", 400);
  }

  // Verify stock for all items first
  for (const item of cart.items) {
    if (!item.product) {
      throw new AppError("One of the products in your cart no longer exists", 404);
    }
    if (item.product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for product ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`,
        400
      );
    }
  }

  // Calculate total amount & prepare order items
  let totalAmount = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const itemTotal = item.product.price * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    });

    // Decrement product stock
    item.product.stock -= item.quantity;
    await item.product.save();
  }

  // Create the order
  const order = await Order.create({
    user: userId,
    items: orderItems,
    totalAmount,
    shippingAddress,
    paymentMethod: paymentMethod || "Cash",
    paymentStatus: "pending",
    status: "pending",
  });

  // Clear the user's cart
  cart.items = [];
  await cart.save();

  return order;
};

const getUserOrders = async (userId) => {
  return await Order.find({ user: userId })
    .populate("items.product")
    .sort({ createdAt: -1 });
};

const getAllOrders = async () => {
  return await Order.find()
    .populate("user", "name email")
    .populate("items.product")
    .sort({ createdAt: -1 });
};

const getOrderById = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId)
    .populate("user", "name email")
    .populate("items.product");

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Authorization check
  if (userRole !== "admin" && order.user._id.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to view this order", 403);
  }

  return order;
};

const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new AppError("Invalid order status", 400);
  }

  const order = await Order.findById(orderId).populate("items.product");
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // If status is updated to cancelled, restore stock
  if (status === "cancelled" && order.status !== "cancelled") {
    for (const item of order.items) {
      if (item.product) {
        item.product.stock += item.quantity;
        await item.product.save();
      }
    }
  }

  order.status = status;
  await order.save();

  return order;
};

const cancelOrder = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId).populate("items.product");
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Authorization check
  if (userRole !== "admin" && order.user.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to cancel this order", 403);
  }

  // Standard users can only cancel pending/processing orders
  if (userRole !== "admin" && !["pending", "processing"].includes(order.status)) {
    throw new AppError(
      `Cannot cancel order. Order has already been ${order.status}`,
      400
    );
  }

  if (order.status === "cancelled") {
    throw new AppError("Order is already cancelled", 400);
  }

  // Restore stock
  for (const item of order.items) {
    if (item.product) {
      item.product.stock += item.quantity;
      await item.product.save();
    }
  }

  order.status = "cancelled";
  await order.save();

  return order;
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
