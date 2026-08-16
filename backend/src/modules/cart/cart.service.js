const Cart = require("./cart.model");
const Product = require("../products/product.model");
const AppError = require("../../utils/appError");

const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const addToCart = async (userId, productId, quantity) => {
  if (quantity < 1) {
    throw new AppError("Quantity must be at least 1", 400);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  let newQuantity = quantity;
  if (itemIndex > -1) {
    newQuantity = cart.items[itemIndex].quantity + quantity;
  }

  if (product.stock < newQuantity) {
    throw new AppError(
      `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`,
      400
    );
  }

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return getCart(userId);
};

const updateCartItem = async (userId, productId, quantity) => {
  if (quantity < 1) {
    throw new AppError("Quantity must be at least 1", 400);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (product.stock < quantity) {
    throw new AppError(
      `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      400
    );
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    throw new AppError("Item not found in cart", 404);
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  return getCart(userId);
};

const removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  await cart.save();
  return getCart(userId);
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return getCart(userId);
  }

  cart.items = [];
  await cart.save();
  return cart;
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
