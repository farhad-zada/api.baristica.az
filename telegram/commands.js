const { getOrder, sendOrdersMessage } = require("./utils");
const User = require("../models/userModel");

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
  await sendOrdersMessage(ctx, order, telegramUserId);
};

async function exportUsersCsv(ctx) {
  const users = await User.find({deleted: false}).select("_id name phone email role addresses statistics").lean();

  let usersCsv = "id,name,phone,email,role,ordersCount,totalSpent\n";
  usersCsv = users.map((user) => {
    return `${user._id},${user.name},${user.phone},${user.email},${user.role},${user.addresses.toString()},${user.statistics.ordersCount},${user.statistics.totalSpent}`;
  }).join("\n");

  let userAddressesCsv = "userId,city,street,apartment,isPrimary\n";
  userAddressesCsv = users.map((user) => {
    return user.addresses.map((address) => {
      return `${user._id},${address.city},${address.street},${address.apartment},${address.isPrimary}`;
    }).join("\n");
  }).join("\n");

  // Remove multiple new lines
  usersCsv = usersCsv.replace(/\n+/g, "\n");
  userAddressesCsv = userAddressesCsv.replace(/\n+/g, "\n");

  ctx.replyWithDocument({
    source: Buffer.from(usersCsv),
    filename: "users.csv",
  });

  ctx.replyWithDocument({
    source: Buffer.from(userAddressesCsv),
    filename: "userAddresses.csv",
  });
}

module.exports = {
  order,
  exportUsersCsv,
};

