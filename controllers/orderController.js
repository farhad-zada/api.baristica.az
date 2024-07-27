const { successResponse, errorResponse } = require("../utils/responseHandlers");
const Order = require("../models/orderModel");
const validator = require("validator");
const logger = require("../utils/logger");

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description The request is already validated by the middleware
 */
const index = async (req, res) => {
  try {
    let { pg, pl } = req.query;
    const skip = (pg - 1) * pl;
    const orders = await Order.find()
      .skip(skip)
      .limit(pl)
      .populate("customer", "name email phone");
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
  try {
    const orderId = req.params.orderId;
    const status = req.body.order.status;
    if (!status) {
      return errorResponse(res, "Status is required", 400);
    }
    if (!validator.isMongoId(orderId)) {
      return errorResponse(res, "Invalid id", 429);
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse(res, "Not found", 404);
    }
    order.status = status;
    await order.validate();

    const updatedOrder = await order.save({
      validateBeforeSave: true,
      new: true,
    });

    successResponse(res, updatedOrder, 200);
  } catch (error) {
    if (error.name === "ValidationError") {
      return errorResponse(res, error.message, 400);
    }
    errorResponse(res, error.message, 500);
  }
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

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description The request is already validated by the middleware
 */
const orderPaid = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!validator.isMongoId(orderId)) {
      return errorResponse(res, "Invalid id", 429);
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse(res, "Not found", 404);
    }
    order.status = "paid";
    await order.save();

    // here we will implement a direct to telegeam bot so the order will be sent to telegram group
    successResponse(res, "Order paid successfully", 200);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

const orderCheck = async (req, res) => {
  logger.info(`Body: ${JSON.stringify(req.body)}`);
  logger.info(`Params: ${JSON.stringify(req.params)}`);
  res.status(200).json({ message: "Order check" });
};

module.exports = {
  index,
  orderById,
  createOrder,
  updateOrder,
  deleteOrder,
  orderPaid,
  orderCheck,
};
