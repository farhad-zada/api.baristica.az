const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");
const config = require("../../config")
const bot = require("../bot");

/**
 * @param {Telegraf.Context} ctx
 */
function getTelegramUserId(ctx) {
  let telegramUserId;
  if (ctx.message) {
    telegramUserId = ctx.message.from.id;
  } else if (ctx.update) {
    telegramUserId = ctx.update.callback_query.from.id;
  }
  ctx.userId = telegramUserId;
  return telegramUserId;
}

/**
 *
 * @param {Object | String} status
 * @returns {object} orders
 */
async function getOrder(userId) {
  const order = await Order.findOne({
    seen: { $nin: [userId] },
    status: { $in: ["paid", "cash"] },
  })
    // .populate("items.product")
    .populate("customer", "name email phone")
    .sort("createdAt");

  return order;
}

function getDeliveryInfo(order, user) {
  let deliveryInfo = "\nDELIVERY: \n";
  if (order.deliveryMethod == "pickup") {
    return "\nDELIVERY: mağazadan\n";
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
      item.product = item.product.toObject();
      return (
        `Ad: ${item.product.name.az}\n` +
        `Kod: ${item.product.code}\n` +
        (item.product.productType == "Coffee"
          ? `Çəki: ${item.product.weight} ${
              item.product.category == "drip" ? "əd." : "qr."
            }\nÜyüdülmə üsulu: ${item.grindingOption}\n`
          : ``) +
        `Miqdar: ${item.quantity}\n` +
        `Qiymət: ${(item.price / 100).toFixed(2)} AZN\n`
      );
    })
    .join("- - -\n");
}
/**
 * @param {Array} orders
 */
const orderMessage = (order, user) => {
  const msg =
    `MÜŞTƏRİ: \n` +
    `Ad: ${order.customer.name}\n` +
    `Tell: ${order.customer.phone}\n` +
    getDeliveryInfo(order, user) +
    "\nMƏHSULLAR:\n" +
    getItemsInfo(order) +
    `\nXÜLASƏ: \n` +
    `Sifariş ID: ${order._id}\n` +
    `Status: ${order.status}\n` +
    `Rüsum: ${(order.cost / 100).toFixed(2)} AZN\n` +
    `Çatdırılma rüsumu: ${(order.deliveryFee / 100).toFixed(2)} AZN\n\n` +
    `Cəm rüsum: ${(order.totalCost / 100).toFixed(2)} AZN\n\n` +
    `Sifariş tarixi: ${order.createdAt}\n`;

  return msg;
};

/**
 *
 * @param {Telegraf.Context} ctx
 */
const sendOrdersMessage = async (ctx, order) => {
  const user = await User.findById(order.customer.id);
  const items = await Promise.all(
    order.items.map((item) => Product.findById(item.product))
  );
  order.items = order.items.map((item, index) => ({
    ...item,
    product: items[index],
  }));
  if (process.env.TG_ENV.startsWith("prod")) {
    let ord = await Order.findById(order._id);
    if (ord && ord.seen === undefined) {
      ord.seen = [];
    }
    let userId = getTelegramUserId(ctx);
    ord.seen.push(userId);
    await ord.save();
  }
  let message = orderMessage(order, user);
  return ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Next Order ⏭️",
            callback_data: "get_next_unseen_order",
          },
        ],
      ],
    },
  });
};

async function sendLastUnseenOrderMessage(ctx) {
  let userId = getTelegramUserId(ctx);
  let order = await getOrder(userId);
  if (!order) {
    ctx.reply("All orders seen ✅");
    return;
  }
  order = order.toObject();
  sendOrdersMessage(ctx, order);
}

async function sendByIdOrderMessage(ctx) {
  const [, orderId] = ctx.match;

  let order = await Order.findById(orderId);
   if (!order) {
    ctx.reply("invalid order id 🫤");
    return;
  }

  order = order.toObject();
  await sendOrdersMessage(ctx, order);
}

async function notifyError(message) {
  if (config.tg.chatId) {
    config.tg.chats.forEach((chatId) => {
      bot.telegram.sendMessage(
        chatId,
        `🆘 Error: \n${message}`,
      );
    });
  }
}

async function notifyAdmins(orderId) {
  let order = await Order.findById(orderId);
  if (config.tg.chats && config.tg.chats.length > 0) {
    config.tg.chats.forEach((chatId) => {
      bot.telegram.sendMessage(
        chatId,
        `New order! \n${order.id}\n${(order.totalCost || 100).toFixed(2)}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "See 🧾",
                  callback_data: `get_order_${order.id}`,
                },
              ],
            ],
          },
        }
      );
    });
  }
}

module.exports = {
  getOrder,
  sendOrdersMessage,
  getTelegramUserId,
  sendLastUnseenOrderMessage,
  sendByIdOrderMessage,
  notifyAdmins,
  notifyError,
};
