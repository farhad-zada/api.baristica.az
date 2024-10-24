const validator = require("validator");
const Comment = require("../models/commentModel");
const Product = require("../models/productModel");
const { errorResponse, successResponse } = require("../utils/responseHandlers");
const logger = require("../utils/logger");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function all(req, res, next) {
  const product = req.params.productId;
  let { pg, lt } = req.query;
  const skip = (pg - 1) * lt;

  let comments = [];
  if (product) {
    comments = await Comment.find({ product });
  } else if (req.user) {
    comments = await Comment.find({ user: req.user.id }).skip(skip).limit(lt);
  }

  return successResponse(res, { comments }, 200);
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function create(req, res, next) {
  try {
    // TODO: add media handling
    const { text, productId } = req.body;
    if (!productId) {
      return errorResponse(res, "Product ID not found!", 400);
    }

    if (!validator.isMongoId(productId)) {
      return errorResponse(res, "Invalid product id!", 400);
    }
    if (!text) {
      return errorResponse(res, "Cannot put an empty comment!", 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, "Product not found!", 404);
    }
    const comment = await Comment.create({
      user: req.user.id,
      product: productId,
      text,
    });

    return successResponse(res, { comment }, 200);
  } catch (error) {
    logger.error(error.message + "\n", error.trace);
    return errorResponse(
      res,
      "Something went wrong on our side! Comment could not be added.",
      500
    );
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function update(req, res, next) {
  try {
    const commentId = req.params.id;

    if (!commentId) {
        return errorResponse(res, "Comment ID not found!", 400);
      }
  
      if (!validator.isMongoId(commentId)) {
        return errorResponse(res, "Invalid comment id!", 400);
      }

    const { text } = req.body;

    if (!text) {
      return errorResponse(res, "Cannot put an empty comment!", 400);
    }

    const comment = await Comment.findOne({_id: commentId, user: req.user.id});

    if (!comment) {
      return errorResponse(res, "Comment not found!", 404);
    }

    comment.text = text;

    await comment.save();

    return successResponse(res, { comment }, 200);
  } catch (error) {
    logger.error(error.message, error.trace);
    return errorResponse(
      res,
      "Something went wrong on our side! Please contact support!",
      500
    );
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function remove(req, res, next) {
  try {
    const commentId = req.params.id;


    if (!commentId) {
        return errorResponse(res, "Comment ID not found!", 400);
      }
  
      if (!validator.isMongoId(commentId)) {
        return errorResponse(res, "Invalid comment id!", 400);
      }

    const comment = await Comment.findOneAndDelete({_id: commentId, user: req.user.id});

    return successResponse(res, { comment }, 200);
  } catch (error) {
    return errorResponse(
      res,
      "Something went wrong on our side! Please contact support!",
      500
    );
  }
}

module.exports = {
  all,
  create,
  update,
  remove,
};
