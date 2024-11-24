const { Telegraf } = require("telegraf");
require("dotenv").config();
const commands = require("./commands");
const { haveAccess } = require("./auth");
const updateStatus = require(`${__dirname}/utils/updateStatus`);

const bot = new Telegraf(process.env.TG_BOT_API_TOKEN);

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
        keyboard: [["Latest Orders", "All Orders"]],
        resize_keyboard: true,
      },
    }
  );
});

bot.hears(["Test", "test"], (ctx) => {
  console.log("Test Payment");
  console.log(ctx.message);
  ctx.sendInvoice({
    currency: "AZN",
    chat_id: ctx.from.id,
    title: "Test Payment",
    description: "Test Payment Description",
    provider_token: process.env.PAYMENT_PROVIDER_TOKEN,
    payload: "test",
    prices: [{ label: "Test Payment", amount: 300 }],
    start_parameter: "test",
  });
});

bot.hears(/my id/i, (ctx) => ctx.reply(ctx.from.id));

bot.hears(["Unpaid", "unpaid", "Unpaid orders", "unpaid orders"], (ctx) =>
  haveAccess(ctx, commands.unpaid)
);

bot.command("orders", (ctx) => haveAccess(ctx, commands.orders));

bot.action(/update_status_(.+)_(.+)/, (ctx) =>
  haveAccess(ctx, updateStatus)
);

module.exports = bot;
