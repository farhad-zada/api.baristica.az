require("dotenv").config();
const commands = require("./commands");
const { haveAccess } = require("./auth");
const getOrderById = require("./utils/getOrderById");
const updateStatus = require(`${__dirname}/utils/updateStatus`);

/**
 * @type {Telegraf<import("telegraf").Context<import("telegraf").Update>>}
 */
const bot = require(`./bot`);

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

bot.hears("orders", (ctx) => haveAccess(ctx, commands.order));

bot.command("orders", (ctx) => haveAccess(ctx, commands.order));

bot.hears("give me users as csv", (ctx) => haveAccess(ctx, commands.exportUsersCsv));

bot.action(/update_status_(.+)_(.+)/, (ctx) => haveAccess(ctx, updateStatus));
bot.action(/get_order_(.+)/, (ctx) => haveAccess(ctx, getOrderById));
bot.action(/get_next_unseen_order/, (ctx) => {
  ctx.message = {
    from: {
      id: ctx.update.callback_query.from.id,
    },
  };

  haveAccess(ctx, commands.order);
});

module.exports = bot;
