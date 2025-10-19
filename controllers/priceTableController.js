/**
 * @type {import("telegraf").Telegraf<import("telegraf").Context<import("telegraf").Updates>>}
 */
const bot = require("../bot");
const config = require("../config");
const logger = require("../utils/logger");

async function getPriceTable(req, res) {
  const { name, phone, email } = req.body;

  let message = [
    "*QİYMƏT CƏDVƏLİ ÜÇÜN MÜRACİƏT*",
    `Ad: \`${name}\``,
    `Telefon: \`${phone}\``,
    `EPoçt: \`${email}\``,
  ].join("\n");
  let chats = await config.tg.safeChats()
  for (let chatId of chats) {
    try {
      bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      logger.error(error);
    }
  }
  res.status(200).json({ message: "Sent message!" });
}

module.exports = {
  getPriceTable,
};
