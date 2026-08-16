const express = require("express");

const router = express.Router();

const productController =
    require("./product.controller");

const { authenticate } =
    require("../auth/auth.middleware");


router.get(
    "/",
    productController.getProducts
);


router.get(
    "/:id",
    productController.getProductById
);


router.post(
    "/",
    authenticate,
    productController.createProduct
);


router.put(
    "/:id",
    authenticate,
    productController.updateProduct
);


router.delete(
    "/:id",
    authenticate,
    productController.deleteProduct
);


module.exports = router;