const { Schema, model } = require("mongoose");

const linkSchema = new Schema({
  products: {
    type: [String],
    ref: "Product",
    required: true,
    index: true,
  },
  field: String,
  data: [
    {
      product: {
        type: String,
        ref: "Product",
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
  ],
});

const Link = model("Link", linkSchema, "links");

module.exports = Link;
