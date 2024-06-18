const { infoMessage } = require("./utils");
/**
 *
 * @param {Telegram.Context} ctx
 */
const hello = (ctx) => {
  const message = `Hello, ${ctx.from.first_name}!
      Here are the available commands:
      /start - Start the bot
      /info - Get information about the bot
      /latest - Get latest orders
      /all - Get all orders`;
  ctx.reply(message, {
    reply_markup: {
      keyboard: [["Latest Orders", "All Orders"]],
      resize_keyboard: true,
    },
  });
};

/**
 *
 * @param {Telegram.Context} ctx
 */
const info = (ctx) => {
  ctx.reply(infoMessage(ctx), {
    reply_markup: {
      keyboard: [["Latest Orders", "All Orders"]],
      resize_keyboard: true,
    },
  });
};

module.exports = {
  hello,
  info,
};
