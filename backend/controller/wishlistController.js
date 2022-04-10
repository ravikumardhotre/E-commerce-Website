const validator = require("../validation/validator");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");
const wishlistModel = require("../model/wishlistModel");

//Creating product

const addProduct = async (req, res) => {
  try {
    const requestBody = req.body;
    //const productId = req.params.productId;
const { productId,userId } = req.params;
    //validation for request body
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message:
          "Invalid request body. Please provide the the input to proceed.",
      });
    }

    //validating userId
    if (!validator.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid userId in params." });
    }

    const searchUser = await userModel.findOne({ _id: userId });
    if (!searchUser) {
      return res.status(400).send({
        status: false,
        message: `user doesn't exists for ${userId}`,
      });
    }
    //Authentication & authorization
    if (searchUser._id.toString() != userId) {
      res.status(401).send({
        status: false,
        message: `Unauthorized access! User's info doesn't match`,
      });
      return;
    }
    //searching product to match the product by userId whose is to be ordered.
    const searchProductDetails = await productModel.findOne({ _id: productId });
    if (!searchProductDetails) {
        return res.status(400).send({
            status: false,
            message: `product doesn't exists for ${productId}`,
        });
    }
    const isProductAlreadyUsed = await productModel.findOne({ product: productId});

    if (isProductAlreadyUsed) {
      res.status(400).send({
        status: false,
        message: `this product is already added in wishlist , go to wishlist page to see the products`,
      });
      return;
    }

    let data = {
      userId: userId,
      productId: productId,
    };

    const addProductInWishlist = await wishlistModel.create(data);
    if (!addProductInWishlist) {
      return res.status(400).send({
        status: false,
        message: `Product doesn't exists for ${userId}`,
      });
    }
    return res.status(200).send({
      status: true,
      message: `Product added successfully`,
      data: addProductInWishlist,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: `Internal server error`,
    });
  }
};

//Getting all products
const getAllProducts = async (req, res) => {
  try {
    const userId = req.userId;
    //validating userId
    if (!validator.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid userId in params." });
    }
    //searching product to match the product by userId whose is to be ordered.
    const searchProductDetails = await productModel.find({});
    if (!searchProductDetails) {
      return res.status(400).send({
        status: false,
        message: `Product doesn't exists`,
      });
    }
    return res.status(200).send({
      status: true,
      message: `Product details fetched successfully`,
      data: searchProductDetails,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: `Internal server error`,
    });
  }
};

// Deeting products
const deleteProduct = async (req, res) => {
  try {
    const requestBody = req.body;
    const userId = req.userId;
    //validation for request body
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message:
          "Invalid request body. Please provide the the input to proceed.",
      });
    }
    //Extract parameters
    const { productId } = requestBody;
    //validating userId
    if (!validator.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid userId in params." });
    }
    //searching product to match the product by userId whose is to be ordered.
    const searchProductDetails = await productModel.findOne({ _id: productId });
    if (!searchProductDetails) {
      return res.status(400).send({
        status: false,
        message: `Product doesn't exists`,
      });
    }
    //Authentication & authorization
    if (searchProductDetails._id.toString() != productId) {
      res.status(401).send({
        status: false,
        message: `Unauthorized access! Product's info doesn't match`,
      });
      return;
    }
    //Deleting product
    const deleteProductDetails = await productModel.findOneAndDelete({
      _id: productId,
    });
    if (!deleteProductDetails) {
      return res.status(400).send({
        status: false,
        message: `Product deletion failed`,
      });
    }
    return res.status(200).send({
      status: true,
      message: `Product deleted successfully`,
      data: deleteProductDetails,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: `Internal server error`,
    });
  }
};

module.exports = { addProduct, getAllProducts, deleteProduct };
