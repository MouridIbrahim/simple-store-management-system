const express = require("express");
const router = express.Router();
const cartController = require("./cart.controller");
const { authenticate } = require("../auth/auth.middleware");

router.use(authenticate); // Apply authentication to all cart routes

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:productId", cartController.updateCartItem);
router.delete("/:productId", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

module.exports = router;
