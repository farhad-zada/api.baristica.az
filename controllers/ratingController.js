const validator = require("validator");
const Rating = require("../models/ratingModel");
const Product = require("../models/productModel");
const { errorResponse, successResponse } = require("../utils/responseHandlers");
const logger = require("../utils/logger");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function rate(req, res, next) {

  try {
    const { rating } = req.body;
    const productId = req.params.id;

    if (rating != undefined && rating != null) {

      if ((rating > 5) | (rating < 1) | typeof(rating) != "number") {
        return errorResponse(
          res,
          "Rating can only be 1, 2, 3, 4, 5. Given: `" + rating + "`",
          400
        );
      }
    }
    if (!productId) {
      return errorResponse(res, "Product ID not found!", 400);
    }

    if (!validator.isMongoId(productId)) {
      return errorResponse(res, "Invalid product id!", 400);
    }

    const product = await Product.findById(productId).select(["id"]);
    if (!product) {
      return errorResponse(res, "Product not found!", 404);
    }
    const query = { user: req.user.id, product: productId };
    const existingRating = await Rating.findOne(query);
    let response = "Successfully saved rating";

    if (!existingRating) {
      await Rating.create({
        user: req.user.id,
        product: productId,
        rating,
      });
    } else if (rating) {
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      await Rating.deleteOne(query);
      response = "Successfully removed rating";
    }

    return successResponse(res, { response, rating: existingRating }, 200);
  } catch (error) {
    logger.error(error.message, error.trace);
    return errorResponse(
      res,
      "Something went wrong on our side! Rating could not be saved.",
      500
    );
  }
}

module.exports = {
  rate,
};
