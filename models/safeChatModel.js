const { Schema, model } = require("mongoose");

const safeChatSchema = new Schema({
    chatId: {
        type: Number, 
        required: true
    },
    name: {
        type: String,
        default: ""
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

safeChatSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});


module.exports = model("SafeChat", safeChatSchema);