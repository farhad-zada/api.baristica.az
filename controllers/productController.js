const { successResponse, errorResponse } = require("../utils/responseHandlers");
const { Document, Model, connection } = require("mongoose");
const Favorite = require("../models/favorites");
const logger = require("../utils/logger");
const Product = require("../models/productModel");

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const findAll = async (req, res) => {
  try {
    const Model = req.Model;
    let { pg, lt, ptp, key } = req.query;
    const skip = (pg - 1) * lt;

    if (key === "popular") {
      key = "statistics.sold";
    } else {
      key = "createdAt";
    }

    const products = await Model.find(ptp ? { productType: ptp } : {})
      .sort({ [key]: -1 }) 
      .skip(skip)
      .limit(lt)
      .lean();

    if (req.user !== undefined) {
      const favorites = await Favorite.find({
        user: req.user.id,
        product: { $in: products },
      });
      products.forEach((product) => {
        const found = favorites.find((fav) => {
          return fav.product.toString() === product._id.toString();
        });
        if (found) {
          product.favorited = true;
        } else {
          product.favorited = false;
        }
      });
    }

    successResponse(res, products, 200);
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const findById = async (req, res) => {
  try {
    const Model = req.Model;
    const productId = req.params.id;
    const product = await Model.findById(productId).lean();
    if (!product) {
      return errorResponse(res, "Not found!", 404);
    }

    if (req.user !== undefined) {
      const favorite = await Favorite.findOne({
        user: req.user.id,
        product: productId,
      });
      product.favorited = favorite ? true : false;
    }
    successResponse(res, product);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const createProduct = async (req, res) => {
  try {
    const Model = req.Model;
    const product = new Model(req.body.product);
    await product.save();
    successResponse(res, {product});
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const updateProduct = async (req, res) => {
  try {
    const Model = req.Model;
    const productId = req.params.id;
    const productUpdated = await Model.findByIdAndUpdate(
      productId,
      req.body.product,
      { runValidators: true, new: true }
    );
    if (!productUpdated) {
      return errorResponse(res, "Not found!", 404);
    }
    successResponse(res, productUpdated);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const linkProducts = async (req, res) => {
  try {
    const Model = req.Model;
    const thisProductId = req.params.id;
    const { product: otherProductId, field } = req.body.link;
    if (!otherProductId || !field) {
      return errorResponse(res, "Bad request!", 400);
    }

    const thisProduct = await Model.findById(thisProductId);
    const otherProduct = await Model.findById(otherProductId);

    if (!thisProduct) {
      return errorResponse(res, "Bad request! This product not found", 404);
    }

    if (!otherProduct) {
      return errorResponse(res, "Bad request! Other product not found", 404);
    }

    const thisFieldValue = thisProduct.get(field);
    const otherFieldValue = otherProduct.get(field);
    if (thisFieldValue === undefined || otherFieldValue === undefined) {
      return errorResponse(
        res,
        `Field "${field}" does not exist in one of the products`,
        400
      );
    }

    await Promise.all([
      linkTo(thisProduct, otherProductId, field, otherFieldValue),
      linkTo(otherProduct, thisProductId, field, thisFieldValue),
    ]);

    return successResponse(res, "linked successfully!", 200);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 *
 * @param {Document} product
 * @param {String} linkingProductId
 * @param {String} field
 * @param {String} fieldValue
 */
const linkTo = async (product, linkingProductId, field, fieldValue) => {
  const newLink = {
    product: linkingProductId,
    field,
    fieldValue,
  };
  const linkExists = product.linked.find(
    (link) => (link.product === linkingProductId) & (link.field = field)
  );

  if (!linkExists) {
    product.linked.push(newLink);
    await product.save();
  }
};

/**
 * @param {import ("express").Request} req
 * @param {import ("express").Response} res
 */
const removeLink = async (req, res) => {
  /**
   * @type {Model}
   */
  const Model = req.Model;

  /**
   * @type {Document}
   */
  const thisProduct = req.product;
  /**
   * @type {String}
   */
  const thisProductId = req.params.productId ?? req.params.id;

  /**
   * @typedef {Object} Link
   * @property {String} product
   * @property {String} field
   * @property {String} fieldValue
   */

  /**
   * @type {Link}
   */
  const { product: otherProductId, field } = req.body.link;

  if (thisProduct.linked && Array.isArray(thisProduct.linked)) {
    thisProduct.linked = thisProduct.linked.filter(
      /**
       * @param {Link} link
       * @returns {boolean}
       */
      (link) => !(link.product === otherProductId && link.field === field)
    );

    await thisProduct.save();
  } else {
    return errorResponse(res, "No links found!", 404);
  }

  /**
   * @type {Document | null}
   */
  const otherProduct = await Model.findById(otherProductId);
  if (
    otherProduct &&
    otherProduct.linked &&
    Array.isArray(otherProduct.linked)
  ) {
    otherProduct.linked = otherProduct.linked.filter(
      /**
       * @param {Link} link
       * @returns {boolean}
       */
      (link) => !(link.product === thisProductId && link.field === field)
    );
    await otherProduct.save();
  } else {
    let reason = "";
    if (!otherProduct) reason = "Other product not found!";
    else if (!otherProduct.linked)
      reason = "Other product's linked list is null!";
    else if (!Array.isArray(otherProduct.linked))
      reason = "Other product's linked field is not an array!";
    else reason = "Unkown reason";
    logger.error(
      `Could not unlink the other product. PRODUCT ID: ${otherProductId}, FIELD: ${field}\nREASON: ${reason}`
    );
  }

  return successResponse(res, "Unlinked successfully!", 200);
};
/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const deleteProduct = async (req, res) => {
  try {
    const Model = req.Model;
    const productId = req.params.id;
    const productDeleted = await Model.findByIdAndUpdate(productId, {
      deleted: true,
      deletedAt: Date.now(),
    });

    if (!productDeleted) {
      return errorResponse(res, "Not found!", 404);
    }
    successResponse(res, "Product deleted successfully");
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  findAll,
  findById,
  linkProducts,
  removeLink,
};
