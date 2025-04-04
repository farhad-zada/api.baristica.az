const mongoose = require("mongoose");
const multiLang = require("./multiLang");

const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    code: { type: String, required: true },
    category: {
      type: String,
      required: true,
      intex: true,
    },
    name: multiLang,
    description: multiLang,
    about: Schema.Types.Mixed,
    linked: {
      type: [
        {
          product: {
            type: String,
            required: true,
          },
          field: String,
          fieldValue: String,
          _id: false,
        },
      ],
    },
    linked_ids: {
      type: [Schema.Types.ObjectId],
      ref: "Link"
    },
    profileImage: {
      type: String,
      required: true,
    },
    images: [String],
    price: {
      type: Number,
      required: true,
      index: true,
    },
    attributes: { type: Array, index: true },
    statistics: {
      sold: {
        type: Number,
        default: 0,
      },
      ratings: {
        type: Number,
        default: 5,
      },
    },
    productType: {
      type: String,
      required: true,
      // default: "coffee",
      immutable: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    discriminatorKey: "productType",
    timeseries: true,
    virtuals: true,
    collection: "products",
  }
);

ProductSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

const Product = model("Product", ProductSchema, "products");

module.exports = Product;
