const { errorResponse } = require("../utils/responseHandlers");
const { Model } = require("mongoose");
const findProductTypeFromId = require("../utils/findProductTypeFromId");
const findProductModelFromType = require("../utils/findProductModelFromType");

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
function getProductModel(req, res, next) {
  const productType = req.productType ?? req.body.productType ?? "Coffee";
  req.Model = findProductModelFromType(productType);
  next();
}

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const attachProductTypeById = (req, res, next) => {
  const id = req.params.id ?? req.params.productId;
  req.productType = findProductTypeFromId(id);
  next();
};
/**
 * Middleware factory to check if the provided product type is allowed.
 *
 * @param {...string} args - Allowed product types.
 * @returns {function(import('express').Request, import('express').Response, import('express').NextFunction): Promise<void>} Middleware function to validate product type.
 */
const allowedProducts =
  (...args) =>
  async (req, res, next) => {
    const productType = req.body.productType;
    if (!productType) {
      return errorResponse(res, "'productType' field is required!", 400);
    }

    if (args.includes(productType)) {
      return next();
    }

    return errorResponse(res, "This product type is not supported! Supported product types are Coffee, Accessory, Machine. Case sencitive!", 400);
  };

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const validateNewCoffee = async (req, res, next) => {
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

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const validateNewAccessory = async (req, res, next) => {
  const { code, category, name, price, description, images } = req.body;

  try {
    next();
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};
/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const validateNewMachine = async (req, res, next) => {
  const { code, category, name, price, description, images } = req.body;

  try {
    next();
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").Request} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
const checkQueryString = (req, res, next) => {
  //  pg (page) is integer between 1 and 1000 and can be omitted
  //  lt (limit) is integer between 1 and 100 and can be omitted
  //  s (string contains) is string and can be omitted this string that name, description or about fields may contain
  const { pg, lt, ptp } = req.query;

  if (pg) {
    if (isNaN(pg) || pg < 1 || pg > 200) {
      return errorResponse(res, "Invalid page. Page should be in range {1..20}", 400);
    }
  } else {
    req.query.pg = 1;
  }

  if (lt) {
    if (isNaN(lt) || lt < 2 || lt > 500) {
      return errorResponse(res, "Invalid limit. Limit should be in range {5...50}", 400);
    }
  } else {
    req.query.lt = 5;
  }
  if (ptp) {
    if (!["Coffee", "Machine", "Accessory"].includes(ptp)) {
      return errorResponse(res, "Invalid product type. Valid product types are 'Coffee', 'Accessory', 'Machine'. Case sencitive!", 400);
    }
    req.productType = ptp;
  } else {
    req.productType = "Coffee";
  }

  next();
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").Request} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
const attachProduct = async (req, res, next) => {
  const productId = req.params.productId ?? req.params.id;

  if (!productId) {
    return errorResponse(
      res,
      "Product ID has not been specified in this route!",
      500
    );
  }
  /**
   * @type {Model}
   */
  const Model = req.Model;

  /**
   * @type {Document | null}
   */
  const product = await Model.findOne({ _id: productId });

  if (!product) {
    return errorResponse(res, "No product found for ID provided!", 404);
  }

  req.product = product;
  next();
};

module.exports = {
  validateNewCoffee,
  validateNewAccessory,
  validateNewMachine,
  allowedProducts,
  getProductModel,
  attachProductTypeById,
  checkQueryString,
  attachProduct,
};
