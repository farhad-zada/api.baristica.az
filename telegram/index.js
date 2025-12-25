require("dotenv").config();
const commands = require("./commands");
const { haveAccess } = require("./auth");
const config = require("../config");

/**
 * @type {Telegraf<import("telegraf").Context<import("telegraf").Update>>}
 */
const bot = require(`./bot`);
const { default: mongoose } = require("mongoose");
const { ServerApiVersion } = require("mongodb");
const Order = require("../models/orderModel");
const { sendByIdOrderMessage, sendLastUnseenOrderMessage, notifyAdmins, notifyError } = require("./utils");
const logger = require("../utils/logger");
const updateStatus = require("./utils/updateStatus")

const startMessages = {
  ru: "Привет! Я Бот Администратор Baristica. Вы можете получать уведомления о заказах через этот чат.",
  en: "Hi! I'm Baristica Admin. You can get order notifications via this chat.",
  az: "Salam! Mən Baristica Admin Botuyam. Bu çat vasitəsilə sifariş bildirişlərini ala bilərsiniz.",
};

bot.start((ctx) => {
  return ctx.reply(
    startMessages[ctx.from.language_code] || startMessages["en"],
    {
      reply_markup: {
        keyboard: [["orders"]],
        resize_keyboard: true,
      },
    }
  );
});

bot.hears(/my id/i, (ctx) => ctx.reply(ctx.from.id));

bot.hears("orders", (ctx) => haveAccess(ctx, sendLastUnseenOrderMessage));

bot.command("orders", (ctx) => haveAccess(ctx, sendLastUnseenOrderMessage));

bot.command("userscsv", ctx => {
  haveAccess(ctx, commands.exportUsersCsv);
})

bot.hears("give me users as csv", (ctx) =>
  haveAccess(ctx, commands.exportUsersCsv)
);

bot.action(/update_status_(.+)_(.+)/, (ctx) => haveAccess(ctx, updateStatus));
bot.action(/get_order_(.+)/, (ctx) => haveAccess(ctx, sendByIdOrderMessage));
bot.action(/get_next_unseen_order/, (ctx) => {
  haveAccess(ctx, sendLastUnseenOrderMessage);
});
(async () => {
  await mongoose.connect(config.db_uri(), {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: true,
    },
  });
})();

async function checkNewOrders() {
  try {
    let orders = await Order.find({
      notified: false,
      $or: [
        {
          status: "cash"
        },
        {
          status: "paid"
        }
      ]
    }).select("_id");

    if (orders.length > 0) {
      logger.info(`New orders with IDs: ${orders.map(o => o.id).join(", ")}`);
      for (let order of orders) {
        await notifyAdmins(order.id);
      }
    } else {
      // logger.info("No new orders yet!");
    }
  } catch (error) {
    logger.error("Something wrong happened at checkNewOrders: \n\n" + error);
    notifyError("Something wrong happened at checkNewOrders: \n\n" + error);
  }
}

const interval = 10 * 1000; // every 10 seconds
setInterval(() => {
  checkNewOrders();
}, interval);

bot.launch();
