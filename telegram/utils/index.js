const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");

/**
 *
 * @param {Object | String} status
 * @returns {object} orders
 */
async function getOrder(userId) {
  const order = await Order.findOne({
    seen: { $nin: [userId] },
    status: "paid",
  })
    .populate("items.product")
    .populate("customer", "name email phone")
    .sort("createdAt");
  // await Order.findByIdAndUpdate(order.id, { $addToSet: { seen: userId } });

  return order;
}

function getDeliveryInfo(order, user) {
  let deliveryInfo = "\nDELIVERY: \n";
  if (order.deliveryMethod == "pickup") {
    return "\nDELIVERY: pickup\n";
  }

  let address = user.addresses.find(
    (address) => address.id.toString() == order.deliveryAddress.toString()
  );

  if (address.city) {
    deliveryInfo = `${deliveryInfo}${address.city}`;
  }
  if (address.street) {
    deliveryInfo = `${deliveryInfo}, ${address.street}`;
  }
  if (address.apartment) {
    deliveryInfo = `${deliveryInfo}, ${address.apartment}\n`;
  }
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(order.eliveryDate);
  deliveryInfo = `${deliveryInfo}${formattedDate} ${order.deliveryHour}\n`;
  return deliveryInfo;
}

function getItemsInfo(order) {
  return order.items
    .map((item) => {
      return (
        `name: ${item.product.name.en}\n` +
        `code: ${item.product.code}\n` +
        (item.product.productType == "Coffee"
          ? `weight: ${item.product.weight} gr.\n`
          : `\n`) +
        `quantity: ${item.quantity}\n` +
        `cost: ${(item.cost / 100).toFixed(2)} AZN\n`
      );
    })
    .join("- - -\n");
}
/**
 * @param {Array} orders
 */
const orderMessage = (order, user) => {
  const msg =
    `CUSTOMER: \n` +
    `Name: ${order.customer.name}\n` +
    `Phone: ${order.customer.phone}\n` +
    getDeliveryInfo(order, user) +
    "\nPRODUCTS:\n" +
    getItemsInfo(order) +
    `\nSUMMARY: \n` +
    `Order ID: ${order._id}\n` +
    `Status: ${order.status}\n` +
    `Cost: ${(order.cost / 100).toFixed(2)} AZN\n` +
    `Delivery Fee: ${(order.deliveryFee / 100).toFixed(2)} AZN\n\n` +
    `Total Cost: ${(order.totalCost / 100).toFixed(2)} AZN\n`;

  return msg;
};

/**
 *
 * @param {Telegraf.Context} ctx
 * @param {Array} orders
 */
const sendOrdersMessage = async (ctx, order) => {
  const user = await User.findById(order.customer.id);
  const items = await Promise.all(
    order.items.map((item) => Product.findById(item.product))
  );
  order.items.forEach((item, i) => (item.product = items[i]));
  await Order.findByIdAndUpdate(order.id, { $addToSet: { seen: userId } });
  return ctx.reply(orderMessage(order, user), {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Delivered",
            callback_data: `update_status_${order.id}_delivered`,
          },
          {
            text: "Cancell",
            callback_data: `update_status_${order.id}_cancell`,
          },
        ],
        [
          {
            text: "Next Order",
            callback_data: "get_next_unseen_order",
          },
        ],
      ],
    },
  });
};

module.exports = {
  getOrder,
  sendOrdersMessage,
};
