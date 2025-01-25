const { getOrder, sendOrdersMessage } = require("./utils");

/**
 * @param {Telegraf.Context} ctx
 */
const order = async (ctx) => {
  let telegramUserId;
  if (ctx.message) {
    telegramUserId = ctx.message.from.id;
  } else if (ctx.update) {
    telegramUserId = ctx.update.callback_query.from.id;
  }
  const order = await getOrder(telegramUserId);
  if (!order) {
    ctx.reply("All orders seen ✅");
    return;
  }
  await sendOrdersMessage(ctx, order);
};

module.exports = {
  order,
};
