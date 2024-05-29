const { successResponse, errorResponse } = require("../utils/responseHandlers");
const Order = require("../models/orderModel");

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description The request is already validated by the middleware
 */
const allOrders = async (req, res) => {
  successResponse(res, "All orders fetched successfully", 200);
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description The request is already validated by the middleware
 */
const orderById = async (req, res) => {
  successResponse(res, "Order fetched successfully", 200);
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description The request is already validated by the middleware
 */
const createOrder = async (req, res) => {
  successResponse(res, "Order created successfully", 201);
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
  successResponse(res, "Order deleted successfully", 200);
};
