const { default: mongoose } = require("mongoose");
const config = require("../config");
const Order = require("../models/orderModel");
const bot = require("../telegram/bot");
const { ServerApiVersion } = require("mongodb");
const userModel = require("../models/userModel");
const uri = config.db_uri();

async function sendTgMsgs() {
  const users = await userModel.find({
    addresses: {
      $exists: true,
      $ne: [],
      $not: {
        $elemMatch: { isPrimary: true },
      },
    },
  });
  users.forEach((user) => console.log(user._id));
  await Promise.all(
    users.map((user) => {
      user.addresses[0].isPrimary = true;
      return user.save();
    })
  );
}
mongoose
  .connect(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: true,
    },
  })
  .then(() =>
    sendTgMsgs()
      .then(() => mongoose.connection.close())
      .catch()
  );
