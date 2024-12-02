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
      status: { $nin: ["initiated", "cancelled by customer", "cancelled by baristica"]},
    })
      .skip(skip)
      .limit(pl)
      .populate("customer", "name email phone");
    successResponse(res, { orders }, 200);
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
      return errorResponse(res, `ID: ${orderId} is not a valid ID!`, 429);
    }
    const order = await Order.find({
      _id: orderId,
      "customer.id": req.user._id,
    });

    if (!order) {
      return errorResponse(res, `Order not found for ID: ${orderId}`, 404);
    }

    successResponse(res, { order }, 200);
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
  if (order.paymentMethod == "cash") {
    order.status = "cash";
    await newOrder.save();
    return successResponse(res, {order: newOrder, redirect: "https://baristica.az/success"});
  }
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
  successResponse(res, { order: newOrder, redirect: responseJson }, 201);
};


/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description The request is already validated by the middleware
 */
const deleteOrder = async (req, res) => {
  const orderId = req.params.orderId;
  if (!validator.isMongoId(orderId)) {
    return errorResponse(res, `ID: ${orderId} is not a valid MongoDB ID!`, 429);
  }
  const order = await Order.findById(orderId);
  if (!order) {
    return errorResponse(res, `No order found for ID: ${orderId}`, 404);
  }

  if (order.customer.toString() !== req.user._id.toString()) {
    return errorResponse(res, "You are not allowed to delete this order", 403);
  }
  order.deleted = true;
  await order.save();

  successResponse(res, { message: "Order deleted successfully" }, 200);
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
      return errorResponse(res, `ID: ${orderId} is not a valid MongoDB ID!`, 429);
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse(res, `No order found for ID: ${orderId}`, 404);
    }
    order.status = "paid";
    await order.save();

    // here we will implement a direct to telegeam bot so the order will be sent to telegram group
    successResponse(res, { message: "Order paid successfully" }, 200);
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
      product.statistics.sold = product.statistics.sold + 1;

      if (req.user) {
        req.user.statistics.weight += product.weight;
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
  successResponse(
    res,
    { message: "Thanks! It was a helpful data and signature!" },
    200
  );
};

module.exports = {
  index,
  orderById,
  createOrder,
  deleteOrder,
  orderPaid,
  orderCheck,
};
