const orderService = require("./order.service");
const AppError = require("../../utils/appError");

const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const order = await orderService.createOrder(
      req.user.id,
      shippingAddress,
      paymentMethod
    );

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    let orders;
    if (req.user.role === "admin") {
      orders = await orderService.getAllOrders();
    } else {
      orders = await orderService.getUserOrders(req.user.id);
    }
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(
      id,
      req.user.id,
      req.user.role
    );

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError("Status is required", 400);
    }

    const order = await orderService.updateOrderStatus(id, status);

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.cancelOrder(
      id,
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
