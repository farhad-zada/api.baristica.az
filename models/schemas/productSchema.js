const mongoose = require("mongoose");
const multiLang = require("../multiLang");

const { Schema } = mongoose;

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
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      required: true,
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

module.exports = ProductSchema;