const cartService = require("./cart.service");
const AppError = require("../../utils/appError");

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      throw new AppError("Product ID is required", 400);
    }

    const qty = quantity !== undefined ? Number(quantity) : 1;
    const cart = await cartService.addToCart(req.user.id, productId, qty);

    res.status(200).json({
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      throw new AppError("Quantity is required", 400);
    }

    const cart = await cartService.updateCartItem(
      req.user.id,
      productId,
      Number(quantity)
    );

    res.status(200).json({
      message: "Cart item updated successfully",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await cartService.removeFromCart(req.user.id, productId);

    res.status(200).json({
      message: "Item removed from cart successfully",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    res.status(200).json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
