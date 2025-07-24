const User = require("../models/userModel");

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
  exportUsersCsv,
};

