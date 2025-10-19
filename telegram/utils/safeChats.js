const logger = require("../../utils/logger");
const bot = require("../bot");

require("dotenv").config()

module.exports = async () => {
    let chats = [];
    for (let chatID of process.env.TG_CHATS.split(",")) {
        try {
            await bot.telegram.getChat(chatID);
            chats.push(chatID);
        } catch (error) {
            logger.error(`Something went wrong at safeChats. Chat ID={${chatID}}: \n\n` + error);
        }
    }
    return chats;
}