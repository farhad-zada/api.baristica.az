const Product = require("../models/productModel");
const { errorResponse } = require("../utils/responseHandlers");
/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const newProduct = async (req, res, next) => {
  const {
    name,
    price,
    weight,
    description,
    about,
    discount,
    roastingTemperature,
    roastingTime,
    roastingLevel,
  } = req.body;
  try {
    next();
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  validateNewProduct: newProduct,
};
