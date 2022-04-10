const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const orderController = require("../controller/orderController");
const productController = require("../controller/productController");
const cartController = require("../controller/cartController");
const productReview = require("../controller/productReviewController");
const wishlistController = require("../controller/wishlistController");
const middleware = require("../middleware/loginMiddle");

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);

router.post("/enterOtp", userController.enterOtp);
router.post("/logout", userController.loginOutUser);

// order the
router.post(
  "/users/:userId/orders",
  middleware.userAuth,
  orderController.orderCreation
);

//cart the
router.post(
  "/users/:userId/cart",
  middleware.userAuth,
  cartController.cartCreation
);

// product
router.post("/products", productController.productCreation);
router.get("/getProducts", productController.productList);
// review
router.post("/products/:productId/review", productReview.createReview);

// add product on wishlist
router.post(
  "/users/:userId/:productId/wishlist",wishlistController.addProduct
);
router.get(
  "/users/:userId/wishlist",

  wishlistController.getAllProducts
);
router.delete(
  "/users/:userId/wishlist/:productId",
  middleware.userAuth,
  wishlistController.deleteProduct
);

module.exports = router;
