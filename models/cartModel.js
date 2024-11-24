const { Schema, model } = require("mongoose");

const cartItem = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "`customer` must be provided"],
      index: true,
    },
    product: {
      type: String,
      refPath: "productType",
      required: [true, "`product` is required!"],
      index: true,
    },
    productType: {
        type: String, 
        enum: ["Coffee", "Accessory", "Machine"],
        index: true, 
        required: true
    },
    quantity: {
      type: Number,
      default: 1,
    },
  },
  { virtuals: true, timestamps: true, collection: "cart" }
);

const Cart = model("Cart", cartItem);

module.exports = Cart;
