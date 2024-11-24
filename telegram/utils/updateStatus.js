const Order = require("../../models/orderModel");

module.exports = async function handleStatus(ctx) {
  const [, orderId, action] = ctx.match;
  let newStatus;
  let keyboardStatus = "Delivered ✅";
  let newInlineKeyboard;
  if (action === "delivered") {
    newStatus = "delivered";
    newInlineKeyboard = [
      [
        {
          text: keyboardStatus,
          callback_data: `update_status_${orderId}_paid`,
        },
      ],
    ];
  } else if (action === "cancell") {
    keyboardStatus = "Cancelled ❌";
    newStatus = "cancelled by baristica";
    newInlineKeyboard = [
      [
        {
          text: keyboardStatus,
          callback_data: `update_status_${orderId}_paid`,
        },
      ],
    ];
  } else if (action === "paid") {
    newInlineKeyboard = [
      [
        {
          text: "Delivered",
          callback_data: `update_status_${orderId}_delivered`,
        },
        {
          text: "Cancell",
          callback_data: `update_status_${orderId}_cancell`,
        },
      ],
    ];
    newStatus = "paid";
  } else {
    return ctx.answerCbQuery("Invalid action!");
  }
  try {
    await Order.findByIdAndUpdate(orderId, { status: newStatus });

    await ctx.editMessageReplyMarkup({
      inline_keyboard: newInlineKeyboard,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    await ctx.answerCbQuery("Failed to update order status.");
  }
};
