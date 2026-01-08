const mongoose = require("mongoose");
const ProductSchema = require("./schemas/productSchema");

const { model } = mongoose;

const Product = model("Product", ProductSchema, "products");

module.exports = Product;
