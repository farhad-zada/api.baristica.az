const Order = require("../models/orderModel");
const { errorResponse } = require("../utils/responseHandlers");
const { delivery_fee } = require("../config");
const Product = require("../models/productModel");

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const validateOrder = async (req, res, next) => {
  try {
    req.body.order.customer = req.user._id;
    req.body.order.deliveryFee = delivery_fee;

    const itemsPromises = req.body.order.items.map(async (item) =>
      Product.findById(item.product).select("price")
    );
    const items = await Promise.all(itemsPromises);

    if (items.some((item) => !item)) {
      return errorResponse(res, "Invalid product id", 400);
    }

    req.body.order.items.forEach((item, index) => {
      item.cost = items[index].price;
      item.totalCost = item.cost * item.quantity;
    });
    req.body.order.cost = req.body.order.items.reduce(
      (acc, item) => acc + item.totalCost,
      0
    );
    req.body.order.totalCost = req.body.order.cost + delivery_fee;
    req.body.order.status = "initiated";
    req.body.order = await Order.validate(req.body.order);
    next();
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  validateOrder,
};
