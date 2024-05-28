const Product = require("../models/productModel");
const { errorResponse } = require("../utils/responseHandlers");
/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const validateNewProduct = async (req, res, next) => {
  try {
    req.body.product = await Product.validate(req.body.product);
    next();
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  validateNewProduct,
};
