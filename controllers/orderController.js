const { successResponse, errorResponse } = require("../utils/responseHandlers");
const Order = require("../models/orderModel");
const validator = require("validator");
const logger = require("../utils/logger");
const crypto = require("crypto");
const config = require("../config");
const Product = require("../models/productModel");

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description The request is already validated by the middleware
 */
const index = async (req, res) => {
  try {
    let { pg, pl } = req.query;
    const skip = (pg - 1) * pl;

    const orders = await Order.find({
      "customer.id": req.user._id,
    })
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
    const order = await Order.find({
      _id: orderId,
      "customer.id": req.user._id,
    });

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
  let amount = newOrder.totalCost / 100;
  if (process.env.NODE_ENV === "development") {
    amount = amount / 100;
  }
  amount = amount.toFixed(2);

  const epointData = {
    order_id: newOrder._id,
    public_key: config.epointPublicKey,
    amount: amount,
    currency: "AZN",
    language: "az",
    description: "Order payment",
  };
  const data64 = Buffer.from(JSON.stringify(epointData)).toString("base64");
  const combinedData = `${config.epointPrivateKey}${data64}${config.epointPrivateKey}`;
  const signature = crypto
    .createHash("sha1")
    .update(combinedData, "utf8")
    .digest("base64");

  const queryParams = new URLSearchParams({
    data: data64,
    signature,
  });
  const requestUrl = `${config.epointRequestUrl}?${queryParams.toString()}`;
  logger.info(`Request URL: ${requestUrl}`);

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const responseJson = await response.json();
  logger.info(`Response: ${JSON.stringify(responseJson)}`);
  newOrder.transaction = responseJson.transaction;
  await newOrder.save();
  newOrder.transaction = undefined;
  successResponse(res, { order: newOrder, epoint: responseJson }, 201);
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
  req.order.status = "paid";
  await req.order.save();

  req.order.items.forEach(async (item) => {
    const product = await Product.findById(item.id);
    if (product) {
      if (!product.sold) product.sold = 0;
      if (!product.stock) product.stock = 0;
      const sold = item.options
        .map((option) => option.quantity)
        .reduce((a, b) => a + b, 0);
      product.sold += sold;
      product.stock -= sold;

      if (product.stock < 0) {
        product.stock = 0;
      }

      if (req.user) {
        req.user.statistics.weight += item.options
          .map((option) => option.weight)
          .reduce((a, b) => a + b, 0);
      }
      await product.save({ validateBeforeSave: false });
    }
  });
  if (req.user) {
    req.user.statistics.totalOrders += 1;
    req.user.statistics.totalSpent += req.order.totalCost;
    req.user.statistics.ordersCompleted += 1;
    await req.user.save();
  }
  successResponse(res, "Thanks! It was a helpful data and signature!", 200);
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
