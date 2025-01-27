/**
 * @type {import("telegraf").Telegraf<import("telegraf").Context<import("telegraf").Updates>>}
 */
const bot = require("../telegram");
const config = require("../config");

function getPriceTable(req, res) {
  const { name, phone, email } = req.body;

  let message = [
    "*QİYMƏT CƏDVƏLİ ÜÇÜN MÜRACİƏT*",
    `Ad: \`${name}\``,
    `Telefon: \`${phone}\``,
    `EPoçt: \`${email}\``,
  ].join("\n");
  config.tg.chats.forEach((chatId) => {
    bot.telegram.sendMessage(chatId, message, {parse_mode: 'Markdown'});
  });
  res.status(200).json({ message: "Sent message!" });
}

module.exports = {
  getPriceTable,
};
