const { Telegraf } = require("telegraf");
require("dotenv").config();
const commands = require("./commands");
const { hello, info, addNewIds } = require("./hears");
const { haveAccess } = require("./auth");
const Order = require("../models/orderModel");

const bot = new Telegraf(process.env.TG_BOT_API_TOKEN);

bot.start((ctx) =>
  ctx.reply("Hi, I'm Baristica Admin Bot. I'll guide you through the orders.", {
    reply_markup: {
      keyboard: [["Latest Orders", "All Orders"]],
      resize_keyboard: true,
    },
  })
);
bot.hears(["Test", "test"], (ctx) => {
  // return payment
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

bot.on("pre_checkout_query", (ctx) => {
  ctx
    .answerPreCheckoutQuery(true)
    .then(() => console.log("Pre-checkout query answered"))
    .catch((err) => console.error("Failed to answer pre-checkout query", err));
});

bot.on("callback_query", async (ctx) => {
  const { data } = ctx.callbackQuery;

  if (!data.startsWith("delivered_")) return;

  const orderId = data.split("_")[1];

  const order = await Order.findById(orderId);

  if (!order) {
    ctx.reply("Order not found.");
    return;
  }

  if (order.status === "delivered") {
    ctx.reply("Order already marked as delivered.");
    return;
  }

  order.status = "delivered";

  await order.save();

  ctx.editMessageReplyMarkup({
    inline_keyboard: [],
  });
  ctx.answerCbQuery("Order marked as delivered.");
  ctx.reply("Order marked as delivered. ✅");
});

bot.hears(["my id", "My id"], (ctx) => ctx.reply(ctx.from.id));

bot.hears("Latest Orders", (ctx) => haveAccess(ctx, commands.latest));

bot.hears("All Orders", (ctx) => haveAccess(ctx, commands.all));

bot.hears(["Unpaid", "unpaid", "Unpaid Orders"], (ctx) =>
  haveAccess(ctx, commands.unpaid)
);

bot.hears(["hello", "Hello"], hello);

bot.hears(["info", "bot", "Bot", "Info"], info);

bot.command("latest", (ctx) => haveAccess(ctx, commands.latest));

bot.command("all", (ctx) => haveAccess(ctx, commands.all));

bot.command("info", info);

bot.command("unpaid", (ctx) => haveAccess(ctx, commands.unpaid));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

module.exports = bot;
