const { default: mongoose } = require("mongoose");
const config = require("../config");
const Order = require("../models/orderModel");
const bot = require("../telegram/bot");
const { ServerApiVersion } = require("mongodb");
const logger = require("../utils/logger");
const uri = config.db_uri();

async function sendTgMsgs() {
  const orders = await Order.find({
    seen: { $size: 0 },
    createdAt: { $gte: Date.parse("2025-07-01") },
  });
  console.log(orders.length);
  console.log(orders[0]);
  let chats = await config.tg.safeChats();
  for (let chatId of chats) {
    try {
      bot.telegram.sendMessage(
        chatId,
        `New order! \n${order._id}\n${(order.totalCost / 100).toFixed(2)}`,
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
    } catch (error) {
      logger.error(error);
    }
  }
}
mongoose
  .connect(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: true,
    },
  })
  .then(() =>
    sendTgMsgs()
      .then(() => mongoose.connection.close())
      .catch()
  );
