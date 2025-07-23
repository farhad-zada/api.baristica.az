const { default: mongoose } = require("mongoose");
const config = require("../config");
const Order = require("../models/orderModel");
const bot = require("../telegram/bot");
const { ServerApiVersion } = require("mongodb");
const uri = config.db_uri();

async function sendTgMsgs() {
  const orders = await Order.updateMany(
    {
      seen: { $size: 0 },
      createdAt: { $gte: Date.parse("2025-07-01") },
      paymentMethod: "card",
    },
    {
      status: "paid",
    }
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
