const validator = require("validator");
const Comment = require("../models/commentModel");
const Product = require("../models/productModel");
const { errorResponse, successResponse } = require("../utils/responseHandlers");
const logger = require("../utils/logger");
const { connection } = require("mongoose");
const findProductModelFromType = require("../utils/findProductModelFromType");
const findProductTypeFromId = require("../utils/findProductTypeFromId");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function all(req, res) {
  const product = req.params.productId;
  let { pg, lt } = req.query;
  const skip = (pg - 1) * lt;

  let comments = [];
  if (product) {
    comments = await Comment.find({ product })
      .populate("user", "name")
      .skip(skip)
      .limit(lt)
      .exec();
  } else if (req.user) {
    comments = await Comment.find({ user: req.user.id })
      .populate("user", "name")
      .skip(skip)
      .limit(lt)
      .exec();
  }

  let products = {};
  for (let comment of comments) {
    if (!products[comment.product]) {
      let Model = findProductModelFromType(
        findProductTypeFromId(comment.product)
      );
      products[comment.product] = await Model.findById(comment.product);
    }
  }

  return successResponse(res, { comments, products }, 200);
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function create(req, res, next) {
  try {
    if (!req.body.comment) {
      return errorResponse(res, `comment field is not provided!`, 400);
    }
    let { text, productId, photourls } = req.body.comment;
    if (!productId) {
      return errorResponse(res, "Product ID not found!", 400);
    }

    if (!text) {
      return errorResponse(res, "Cannot put an empty comment text!", 400);
    }

    if ((photourls != undefined) & !Array.isArray(photourls)) {
      return errorResponse(res, `'photourls' must be array of URLs!`, 400);
    }

    const urlRegex =
      /^https:\/\/api\.baristica\.az\/md\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[a-zA-Z0-9]+$/i;

    for (url of photourls) {
      if (!urlRegex.test(url)) {
        return errorResponse(res, `'${url}' is not a valid url!`, 400);
      }
    }

    const product = await connection
      .collection("products")
      .findOne({ _id: productId });

    if (!product) {
      return errorResponse(res, "Product not found!" + `ID: ${productId}`, 404);
    }
    const comment = await Comment.create({
      user: req.user.id,
      product: productId,
      text,
      photourls,
    });

    return successResponse(res, { comment }, 200);
  } catch (error) {
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
      return errorResponse(res, `${commentId} is not a valid mongoDB id!`, 400);
    }

    const { text } = req.body;

    if (!text) {
      return errorResponse(res, "Cannot put an empty comment text!", 400);
    }

    const comment = await Comment.findOne({
      _id: commentId,
      user: req.user.id,
    });

    if (!comment) {
      return errorResponse(
        res,
        `Comment not found for this ID: ${commentId}`,
        404
      );
    }

    comment.text = text;

    await comment.save();

    return successResponse(res, { comment }, 200);
  } catch (error) {
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
      return errorResponse(res, `${commentId} is not a valid mongoDB id!`, 400);
    }

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      user: req.user.id,
    });

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
