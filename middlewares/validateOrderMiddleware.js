const Order = require("../models/orderModel");
const { errorResponse } = require("../utils/responseHandlers");
const { delivery_fee } = require("../config");
const Product = require("../models/productModel");
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
    req.body.order.customer.id = req.user._id;
    req.body.order.deliveryFee = delivery_fee;
    const itemsPromises = req.body.order.items.map(async (item) =>
      Product.findById(item.id).select("options name _id")
    );
    const items = await Promise.all(itemsPromises);
    if (items.some((item) => !item)) {
      return errorResponse(res, "Invalid product id", 400);
    }

    req.body.order.cost = 0;
    req.body.order.items.forEach((item, index) => {
      item.cost = 0;
      item.options.forEach((option) => {
        const optionFound = items[index].options.find(
          (opt) => opt._id == option.id
        );
        if (optionFound) {
          option.price = optionFound.price;
          option.cost = option.price * option.quantity;
          item.cost += option.cost;
          req.body.order.cost += option.cost;
        } else {
          if (!["development", "local"].includes(process.env.NODE_ENV)) {
            throw new Error(
              "This options is not available for this product. If you think this is a mistake, please contact us."
            );
          }
        }
      });
      item.totalCost = calcTotalCost(
        item.cost,
        item.discount,
        item.discountType
      );
    });
    req.body.order.totalCost = req.body.order.cost + delivery_fee;
    req.body.order.status = "initiated";
    req.body.order.language = req.body.language;
    const validationResult = await Order.validate(req.body.order);
    if (validationResult.error) {
      return errorResponse(res, validationResult.error.message, 400);
    }
    req.body.order = validationResult;
    next();
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  validateOrder,
};
