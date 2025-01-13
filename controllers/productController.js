const { successResponse, errorResponse } = require("../utils/responseHandlers");
const { Document, Model, connection } = require("mongoose");
const Favorite = require("../models/favorites");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const humanReadableError = require("../utils/humanReadableError");

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const findAll = async (req, res) => {
  try {
    const directions = { asc: 1, desc: -1 };
    const levels = { low: [1, 2], medium: [3], high: [4, 5] };
    const coffeeTypes = {
      "bright espresso": {
        acidity: { $in: levels.high },
        category: { $in: ["espresso"] },
      },
      "balanced espresso": {
        acidity: { $in: levels.low },
        category: { $in: ["espresso"] },
      },
      "bright filter": {
        acidity: { $in: levels.high },
        category: { $in: ["filter"] },
      },
      "balanced filter": {
        acidity: { $in: levels.low },
        category: { $in: ["filter"] },
      },
    };
    const Model = req.Model;

    let {
      pg,
      lt,
      qGrader,
      rating,
      processingMethod,
      acidity,
      viscocity,
      country,
      price,
      coffeeType,
      category,
    } = req.query; // Accept 'keys' as a query parameter for multiple sorting fields
    const skip = (pg - 1) * lt;

    let query = Model.find();

    if (price && price in directions) {
      query = query.sort({ price: directions[price] });
    }

    if (rating && rating in directions) {
      query = query.sort({ "statistics.ratings": directions[rating] });
    }

    if (qGrader && qGrader in directions) {
      query = query.sort({ qGrader: directions[qGrader] });
    }

    if (viscocity) {
      let vals = viscocity
        .split(",")
        .map((visc) => {
          if (visc in levels) {
            return levels[visc];
          }
        })
        .filter((val) => val !== null && val !== undefined)
        .flat();

      query = query.find({ viscocity: { $in: vals } });
    }
    if (acidity) {
      let vals = acidity
        .split(",")
        .map((acd) => {
          if (acd in levels) {
            return levels[acd];
          }
        })
        .filter((val) => val !== null && val !== undefined)
        .flat();
      query = query.find({ acidity: { $in: vals } });
    }

    if (processingMethod) {
      let vals = processingMethod.split(",");
      query = query.find({ processingMethod: { $in: vals } });
    }
    if (country) {
      let vals = country.split(",");
      query = query.find({ country: { $in: vals } });
    }

    if (coffeeType) {
      coffeeType.split(",").forEach((value) => {
        if (value in coffeeTypes) {
          query = query.find(coffeeTypes[value]);
        }
      });
    }

    if (!category) {
      if (req.productType === "Machine") {
        category = "1_group,2_group,grinder";
      }
    }

    if (req.productType == "Coffee") {
      query = query.find({$or: [
        {category: "espresso", weight: 1000},
        {category: "filter", weight: 200},
      ]}).sort("category");
    }

    if (category) {
      let vals = category.split(",");
      query = query.find({ category: { $in: vals } });
    }

    const count = await Model.countDocuments(query.getFilter());
    const products = await query.skip(skip).limit(lt).lean();

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
    const pagesCount = Math.ceil(count / lt);

    successResponse(res, products, 200, count, pagesCount);
  } catch (error) {
    console.log(error);
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
      return errorResponse(res, "No product found for the ID provided!", 404);
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
    const id = `${req.body.productType.toLowerCase()}_${uuidv4()}`;
    req.body.product._id = id;
    const product = await Model.create(req.body.product);
    // await product.save();
    successResponse(res, { product });
  } catch (error) {
    console.log(error);
    errorResponse(res, erorr, 500);
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
      return errorResponse(res, "Not product found for the ID provided!", 404);
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
      return errorResponse(
        res,
        "Bad request! `otherProductId` or `field` is not provided!",
        400
      );
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

    return successResponse(
      res,
      { message: "Linked successfully!", thisProduct, otherProduct },
      200
    );
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
    (link) => (link.product === linkingProductId) & (link.field === field)
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
    return errorResponse(res, "These products are not linked!", 404);
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

  return successResponse(
    res,
    { message: "Unlinked successfully!", thisProduct, otherProduct },
    200
  );
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
      return errorResponse(res, "No product found for ID provided!", 404);
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
