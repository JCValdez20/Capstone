const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const AdminOnly = require("../middleware/AdminAuth");

router.post("/add", AdminOnly, ProductController.createProduct);
router.get("/products", ProductController.getAllProducts);
router.get("/products/:_id", ProductController.getProductbyId);

module.exports = router;
