const { successResponse, errorResponse } = require("../utils/responseHandlers");
const Order = require("../models/orderModel");
const validator = require("validator");

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description The request is already validated by the middleware
 */
const index = async (req, res) => {
  try {
    const orders = await Order.find() //TODO: adjust to needs
      .skip(0)
      .limit(20)
      .populate("user", "name email phone");
    successResponse(res, orders, 200);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description The request is already validated by the middleware
 */
const orderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    if (!validator.isMongoId(orderId)) {
      return errorResponse(res, "Invalid id", 429);
    }
    const order = await Order.findById(orderId);

    if (!order) {
      return errorResponse(res, "Not found", 404);
    }

    successResponse(res, order, 200);
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description The request is already validated by the middleware
 */
const createOrder = async (req, res) => {
  const order = req.body.order;
  const newOrder = new Order(order);
  await newOrder.save();
  successResponse(res, newOrder, 201);
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description The request is already validated by the middleware
 */
const updateOrder = async (req, res) => {
  successResponse(res, "Order updated successfully", 200);
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description The request is already validated by the middleware
 */
const deleteOrder = async (req, res) => {
  const orderId = req.params.orderId;
  if (!validator.isMongoId(orderId)) {
    return errorResponse(res, "Invalid id", 429);
  }
  const order = await Order.findById(orderId);
  if (!order) {
    return errorResponse(res, "Not found", 404);
  }

  if (order.customer.toString() !== req.user._id.toString()) {
    return errorResponse(res, "You are not allowed to delete this order", 403);
  }
  order.deleted = true;
  await order.save();

  successResponse(res, "Order deleted successfully", 200);
};

module.exports = {
  index,
  orderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
