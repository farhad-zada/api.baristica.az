const { getOrders, sendOrdersMessage } = require("./utils");

/**
 * @param {Telegraf.Context} ctx
 */
const orders = async (ctx) => {
  
  const orders = await getOrders(ctx.message.from.id);
  if (!orders.length) {
    ctx.reply("All orders seen ✅");
    return;
  }
  orders.forEach(async (order) => {
    await sendOrdersMessage(ctx, order);
  });
};

module.exports = {
  orders
};
