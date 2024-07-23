const validator = require("validator");
const Product = require("../models/productModel");
const Favorite = require("../models/favorites");
const { errorResponse } = require("../utils/responseHandlers");

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const checkIfProductExists = async (req, res, next) => {
  try {
    if (!validator.isMongoId(productId)) {
      return errorResponse(res, "Invalid id", 429);
    }

    const favoriteProduct = await Product.findById(productId);

    if (!favoriteProduct) {
      return errorResponse(res, "Product not found", 404);
    }

    next();
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const checkIfFavoriteExists = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const favorite = await Favorite.findOne({
      user: req.user.id,
      product: productId,
    });
    if (!favorite && req.method === "DELETE") {
      return errorResponse(res, "Favorite not found", 404);
    } else if (favorite && req.method === "POST") {
      return errorResponse(res, "Favorite already exists", 400);
    }

    next();
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

module.exports = { checkIfProductExists, checkIfFavoriteExists };