const Order = require("../../models/orderModel");

module.exports = async function handleStatus(ctx) {
  const [, orderId, action] = ctx.match;
  let newStatus;
  let keyboardStatus = "Undo";
  let answerCbQuery = "Delivered ✅";
  let newEndingText;
  let newInlineKeyboard;
  if (action === "delivered") {
    newStatus = "delivered";
    newInlineKeyboard = [
      [
        {
          text: keyboardStatus,
          callback_data: `update_status_${orderId}_paid`,
        },
        {
          text: "Next Order ⏭️",
          callback_data: "get_next_unseen_order",
        },
      ],
    ];
    newEndingText = "✅✅✅ DELIVERED ✅✅✅";
  } else if (action === "cancell") {
    keyboardStatus = "Uncancell";
    answerCbQuery = "Cancelled ❌"
    newStatus = "cancelled by baristica";
    newInlineKeyboard = [
      [
        {
          text: keyboardStatus,
          callback_data: `update_status_${orderId}_paid`,
        },
        {
          text: "Next Order ⏭️",
          callback_data: "get_next_unseen_order",
        },
      ],
    ];
    newEndingText = "❌❌❌ CANCELLED ❌❌❌";
  } else if (action === "paid") {
    answerCbQuery = "Done ✅";
    newInlineKeyboard = [
      [
        {
          text: "Set Delivered ✅",
          callback_data: `update_status_${orderId}_delivered`,
        },
        {
          text: "Cancell ❌",
          callback_data: `update_status_${orderId}_cancell`,
        },
      ],
      [
        {
          text: "Next Order ⏭️",
          callback_data: "get_next_unseen_order",
        }
      ]
    ];
    newStatus = "paid";
  } else {
    return ctx.answerCbQuery("Invalid action! 👀");
  }
  try {
    await Order.findByIdAndUpdate(orderId, { status: newStatus });

    /**
     * @type {string}
     */
    let prevText = ctx.callbackQuery.message.text;
    let newText = prevText
      .replace(/❌❌❌ CANCELLED ❌❌❌/g, "")
      .replace(/✅✅✅ DELIVERED ✅✅✅/g, "")
      .replace(/\n+$/, "");
    if (newEndingText) {
      newText = newText.concat(`\n\n${newEndingText}`);
    }
    await ctx.editMessageText(newText)
    await ctx.editMessageReplyMarkup({
      inline_keyboard: newInlineKeyboard,
    });
    await ctx.answerCbQuery(answerCbQuery);
  } catch (error) {
    console.error("Error updating order status:", error);
    await ctx.answerCbQuery("Failed to update order status.");
  }
};
