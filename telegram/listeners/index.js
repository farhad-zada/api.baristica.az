/**
 * @param {Telegraf.Context} ctx
 */
const callbackQuery = async (ctx) => {
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
};

const preCheckoutQuery = (ctx) => {
  ctx
    .answerPreCheckoutQuery(true)
    .then(() => console.log("Pre-checkout query answered"))
    .catch((err) => console.error("Failed to answer pre-checkout query", err));
};

module.exports = { callbackQuery, preCheckoutQuery };
