const Rating = require("../models/ratingModel");
const { errorResponse, successResponse } = require("../utils/responseHandlers");
const logger = require("../utils/logger");
const Coffee = require("../models/coffee");
const Accessory = require("../models/accessory");
const Machine = require("../models/machine");

/**
 *
 * @param {Coffee | Accessory | Machine} product
 */
async function updateProductAverageRating(product) {
  try {
    const avgRatings = await Rating.aggregate([
      {
        $match: { product: product.id },
      },
      {
        $group: {
          _id: "product",
          averageRating: { $avg: "$rating" },
        },
      },
    ]);
    if (avgRatings.length == 0) {
      logger.error("Aggregation returned zero results for " + product);
    }
    const { averageRating } = avgRatings[0];
    product.statistics.ratings = averageRating;
    await product.save();
    logger.info(
      `Updated product rating successfully! PRODUCT ID: ${product.id}`
    );
  } catch (error) {
    logger.error(error);
  }
}

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

    const Model = req.Model;

    if (rating != undefined && rating != null) {
      if ((rating > 5) | (rating < 1) | (typeof rating != "number")) {
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

    const product = await Model.findById(productId).select(["id"]);
    if (!product) {
      return errorResponse(res, "Product not found!", 404);
    }
    const query = { user: req.user.id, product: productId };
    let existingRating = await Rating.findOne(query);
    let response = "Successfully saved rating";

    if (!existingRating) {
      existingRating = await Rating.create({
        user: req.user.id,
        product: productId,
        rating,
      });
      product.statistics.rating = product.statistics.rating + rating;
    } else if (rating) {
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      await Rating.deleteOne(query);
      response = "Successfully removed rating";
    }
    updateProductAverageRating(product);
    return successResponse(res, { response, rating: existingRating }, 200);
  } catch (error) {
    logger.error(error);
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
