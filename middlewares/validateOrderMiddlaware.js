const Order = require("../models/orderModel");
const { errorResponse } = require("../utils/responseHandlers");
/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const validateOrder = async (req, res, next) => {
  try {
    req.body.order = await Order.validate(req.body.order);
    next();
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  validateOrder,
};
