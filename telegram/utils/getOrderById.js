const { sendOrdersMessage } = require(".");
const Order = require("../../models/orderModel");

module.exports = async function getOrderById(ctx) {
  const [, orderId] = ctx.match;

  const order = await Order.findById(orderId);
  sendOrdersMessage(ctx, order);
}