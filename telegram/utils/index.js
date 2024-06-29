const mongoose = require("mongoose");
const Order = require("../../models/orderModel");

/**
 *
 * @param {Object | String} status
 * @returns {Array} orders
 */
const getOrders = async (status) => {
  const orders = await Order.find({ status })
    .populate("items.product")
    .sort({ createdAt: -1 })
    .limit(1);

  return orders;
};

/**
 *
 * @param {Telegraf.Context} ctx
 * @param {Array} orders
 */
const sendOrdersMessage = (ctx, orders) => {
  if (!orders.length) {
    ctx.reply("No orders found");
    return;
  }
  orders.map((order) => {
    const message = `Order ID: ${order._id}\nStatus: ${
      order.status
    }\nTotal Cost: ${(order.totalCost / 100).toFixed(2)} AZN\nDelivery Fee: ${(
      order.deliveryFee / 100
    ).toFixed(2)} AZN\nNotes: ${order.notes || "No notes"}\n\nProducts:\n\n${
      order.items.length
        ? order.items
            .map(
              (item) =>
                `Name: ${item.product.name.en}\nProduct ID: ${
                  item.product._id
                }\nQuantity: ${item.quantity}\nPrice: ${(
                  item.product.price / 100
                ).toFixed(2)} AZN\nTotal Cost: ${(item.totalCost / 100).toFixed(
                  2
                )} AZN\n`
            )
            .join("\n")
        : "No products"
    }\n${order.createdAt.toString().split("GMT")[0]}`;

    ctx.reply(message, {
      reply_markup: {
        inline_keyboard: [
          order.status === "paid"
            ? [
                {
                  text: "Mark as Delivered",
                  callback_data: "delivered_" + order._id.toString(),
                },
              ]
            : [],
        ],
      },
    });
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
