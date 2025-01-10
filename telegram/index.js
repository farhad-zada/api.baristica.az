require("dotenv").config();
const commands = require("./commands");
const { haveAccess } = require("./auth");
const updateStatus = require(`${__dirname}/utils/updateStatus`);

/**
 * @type {Telegraf<import("telegraf").Context<import("telegraf").Update>>}
 */
const bot = require(`${__dirname}/bot`);

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

bot.hears(["orders"], (ctx) =>
  haveAccess(ctx, commands.orders)
);

bot.command("orders", (ctx) => haveAccess(ctx, commands.orders));

bot.action(/update_status_(.+)_(.+)/, (ctx) => haveAccess(ctx, updateStatus));

module.exports = bot;
