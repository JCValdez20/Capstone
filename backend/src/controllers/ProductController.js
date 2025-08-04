const Product = require("../models/Products");
const send = require("../utils/Response");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return send.sendResponseMessage(
      res,
      200,
      products,
      "Products retrieved successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

exports.getProductbyId = async (req, res) => {
  try {
    const { _id } = req.params;
    const product = await Product.find({ _id });
    if (!product) {
      return send.sendErrorMessage(res, 404, new Error("Product not found"));
    }

    return send.sendResponseMessage(
      res,
      200,
      product,
      "Product retrieved successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    stock,
    image,
    seller,
    sku,
    brand,
  } = req.body;

  try {
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return send.sendErrorMessage(
        res,
        400,
        new Error("Product already exists")
      );
    }
    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image,
      seller,
      sku,
      brand,
    });

    return send.sendResponseMessage(
      res,
      201,
      newProduct,
      "Product created successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};
