const mongoose = require("mongoose");

/**
 *
 * @param {Object | String} status
 * @returns {Array} orders
 */
const getOrders = async (status) => {
  const query = mongoose.connection.db
    .collection("orders")
    .find({ status })
    .sort({ createdAt: -1 });

  return await query.toArray();
};

/**
 *
 * @param {Telegraf.Context} ctx
 * @param {Array} orders
 */
const sendOrdersMessage = (ctx, orders) => {
  orders.map((order) => {
    const message = `Order ID: ${order._id}\nStatus: ${
      order.status
    }\nTotal Cost: ${(order.totalCost / 100).toFixed(2)} AZN\nDelivery Fee: ${(
      order.deliveryFee / 100
    ).toFixed(2)} AZN\nNotes: ${order.notes || "No notes"}\n\n${
      order.createdAt.toString().split("GMT")[0]
    }\n`;

    ctx.reply(message);
  });
};

/**
 * @param {Telegraf.Context} ctx
 */
const infoMessage = (ctx) =>
  `Hello, ${ctx.from.first_name}!\nI'm Baristica Admin Bot. I notify my admins about new orders. Also I can filter orders based on certain features. E.g. Latest Orders, All Orders, etc.`;

module.exports = {
  getOrders,
  sendOrdersMessage,
  infoMessage,
};
