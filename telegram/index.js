require("dotenv").config();
const commands = require("./commands");
const { haveAccess } = require("./auth");
const updateStatus = require(`${__dirname}/utils/updateStatus`);
const config = require("../config");

/**
 * @type {Telegraf<import("telegraf").Context<import("telegraf").Update>>}
 */
const bot = require(`./bot`);
const { default: mongoose } = require("mongoose");
const { ServerApiVersion } = require("mongodb");
const Order = require("../models/orderModel");
const { sendByIdOrderMessage, sendLastUnseenOrderMessage, notifyAdmins } = require("./utils");

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

bot.hears("give me users as csv", (ctx) =>
  haveAccess(ctx, commands.exportUsersCsv)
);

// bot.action(/update_status_(.+)_(.+)/, (ctx) => haveAccess(ctx, updateStatus));
bot.action(/get_order_(.+)/, (ctx) => haveAccess(ctx, sendByIdOrderMessage));
bot.action(/get_next_unseen_order/, (ctx) => {
  ctx.message = {
    from: {
      id: ctx.update.callback_query.from.id,
    },
  };

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


async function setupOrderStream() {
  const pipeline = [
    { $match: { operationType: { $in: ['insert', 'update'] } } }
  ];
  
  const orderStream = Order.watch(pipeline);
  
  orderStream.on('change', (change) => {
    switch (change.operationType) {
      case 'insert':
        console.log('New document:', change);
        notifyAdmins(change.documentKey._id);
        break;
      case 'update':
        console.log('Updated document ID:', change.documentKey._id);
        console.log('Updated fields:', change.updateDescription.updatedFields);
        const updatedFields = Object.keys(change.updateDescription.updatedFields || {});
        if (!updatedFields.some(field => field.startsWith("seen"))) {
          console.log(`notifying tlegram admins with: ${change}`)
          notifyAdmins(change.documentKey._id);
        } else {
          console.log("skipping, it is a seen change update");
        }
        break;
      case 'delete':
        console.log('Deleted document ID:', change.documentKey._id);
        break;
    }
  });
  
  orderStream.on('error', (err) => {
    console.error('Change stream error:', err);
  });
}

setupOrderStream()

bot.launch();
