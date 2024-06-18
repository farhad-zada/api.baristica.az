const { getOrders, sendOrdersMessage } = require("./utils");
/**
 * @param {Telegraf.Context} ctx
 */
const latest = async (ctx) => {
  const orders = await getOrders("paid");

  sendOrdersMessage(ctx, orders);
};

/**
 * @param {Telegraf.Context} ctx
 */
const all = async (ctx) => {
  const orders = await getOrders({
    $ne: "initiated",
  });

  sendOrdersMessage(ctx, orders);
};

/**
 * @param {Telegraf.Context} ctx
 */
const unpaid = async (ctx) => {
  const orders = await getOrders("initiated");

  sendOrdersMessage(ctx, orders);
};

module.exports = {
  latest,
  all,
  unpaid,
};
