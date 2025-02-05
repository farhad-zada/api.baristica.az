const Order = require("../models/orderModel");
const { errorResponse } = require("../utils/responseHandlers");
const { delivery_fee } = require("../config");
const findProductModelFromType = require("../utils/findProductModelFromType");
const humanReadableError = require("../utils/humanReadableError");
const findProductTypeFromId = require("../utils/findProductTypeFromId");
require("dotenv").config();

const calcTotalCost = (cost, discount, discountType) => {
  if (discount) {
    if (discountType == "percentage") {
      return cost - (cost * discount) / 100;
    } else if (discountType == "fixed") {
      return cost - discount;
    }
    return cost;
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const validateOrder = async (req, res, next) => {
  try {
    req.body.order.customer.id = req.user.id;
    req.body.order.deliveryFee = 0;
    if (req.body.order.deliveryMethod == "delivery") {
      req.body.order.deliveryFee = delivery_fee;
    }

    const itemsPromises = req.body.order.items.map(async (item) => {
      const Model = findProductModelFromType(
        findProductTypeFromId(item.product)
      );
      return Model.findById(item.product);
    });

    const items = await Promise.all(itemsPromises);
    if (items.some((item) => !item)) {
      return errorResponse(res, "Invalid product id provided!", 400);
    }

    req.body.order.items.map((item, idx) => {
      product = items[idx];
      item.price = product.price;
      item.productType = findProductTypeFromId(product.id);
    });

    req.body.order.cost = 0;
    req.body.order.cost = req.body.order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    req.body.order.totalCost = req.body.order.cost + req.body.order.deliveryFee;
    req.body.order.language = req.body.language;

    if (
      req.body.order.deliveryMethod == "delivery" &&
      !req.body.order.deliveryAddress
    ) {
      const defaultAddress = req.user.getDefaultAddress();
      if (defaultAddress) {
        req.body.order.deliveryAddress = defaultAddress.id;
      }
    }

    const validationResult = await Order.validate(req.body.order);
    if (validationResult.error) {
      const humanReadableErrors = humanReadableError(validationResult);
      return errorResponse(res, humanReadableErrors, 400);
    }

    req.body.order = validationResult;
    next();
  } catch (error) {
    console.log(error);
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  validateOrder,
};
