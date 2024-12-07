const { Telegraf } = require("telegraf");
require("dotenv").config();


const bot = new Telegraf(process.env.TG_BOT_API_TOKEN);

module.exports = bot;