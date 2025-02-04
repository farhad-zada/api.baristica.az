const { successResponse, errorResponse } = require("../utils/responseHandlers");
const logger = require("../utils/logger");
const humanReadableError = require("../utils/humanReadableError");
const Link = require("../models/linkModel");
const Machine = require("../models/machine");
const findProductTypeFromId = require("../utils/findProductTypeFromId");
const findProductModelFromType = require("../utils/findProductModelFromType");

async function createLink(req, res) {
  try {
    const { products, field } = req.body;
    if (!products || !Array.isArray(products) || products.length == 0) {
      return errorResponse(
        res,
        "products field should be array of product ids"
      );
    }
    let productType = findProductTypeFromId(products[0]);
    let Model = findProductModelFromType(productType);
    const productsFieldValues = await Model.find({
      _id: { $in: products },
    }).select(field);
    if (!productsFieldValues || productsFieldValues.length !== products.length) {
      return errorResponse(res, "Could not find products!", 400);
    }
    const linkData = productsFieldValues.map((prd) => {
      return { product: prd.id, value: prd[field] };
    });
    if (!linkData || linkData.length == 0) {
      return errorResponse(res, "Could not create link data!", 400);
    }
    const link = new Link({ products, field, data: linkData });
    await link.save();
    return successResponse(res, { link });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "The request body was not correct!");
  }
}

async function getLinks(req, res) {
  try {
    let productId = req.params.productId;
    const links = await Link.find({ products: { $in: [productId] } });
    return successResponse(res, { links });
  } catch (error) {
    logger.error(error);
    return errorResponse(res, humanReadableError(error));
  }
}

async function deleteLink(req, res) {
  try {
    let linkId = req.params.linkId;
    await Link.findByIdAndDelete(linkId);
    return successResponse(res, { message: "Link deleted successfully" });
  } catch (error) {
    logger.error(error);
    return errorResponse(res, humanReadableError(error));
  }
}

module.exports = {
  createLink,
  getLinks,
  deleteLink,
};
