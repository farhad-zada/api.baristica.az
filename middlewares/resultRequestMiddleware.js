const { errorResponse } = require("../utils/responseHandlers");
const Order = require("../models/orderModel");
const logger = require("../utils/logger");
const crypto = require("crypto");
const config = require("../config");

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 * @description this middleware checks if the signature is valid
 */
const checkSignature = (req, res, next) => {
  const { data, signature } = req.body;
  const mySignature = crypto
    .createHash("sha1")
    .update(config.epointPrivateKey + data + config.epointPrivateKey)
    .digest("base64");
  if (mySignature !== signature) {
    logger.info(
      `Invalid signature!\nData: ${data}\nMy signature: ${mySignature}\nReceived signature: ${signature}`
    );
    return errorResponse(res, `Invalid signature!`, 403);
  } else {
    const checkData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    req.checkData = checkData;
    next();
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 * @description this middleware checks if the signature is valid
 */
const confirmStatus = async (req, res, next) => {
  const { transaction, status, order_id } = req.checkData;
  const bankResponse = req.checkData.bank_response;
  if (status === "success" && bankResponse.startsWith("RESULT: OK")) {
    const order = await Order.findById(order_id);
    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }
    if (order.status !== "initiated") {
      logger.error(`Order status is not initiated!\nOrder: ${order}`);
      logger.error(`req.checkData: ${req.checkData}`);
      return errorResponse(
        res,
        "This order status is not compatible to be processed",
        400
      );
    }
    req.order = order;
  } else {
    return errorResponse(res, "Transaction failed", 400);
  }
  next();
};

module.exports = {
  checkSignature,
  confirmStatus,
};
