const mongoose = require("mongoose");
const { v4: uuidv4, validate } = require("uuid");
const slugify = require("slugify");

const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "There must be a valid price"],
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    slug: {
      type: String,
      // unique: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
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
    timestamps: true,
  }
);

ProductSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true, strict: true, locale: "en" });
  next();
});

ProductSchema.pre("update", function (next) {
  this.updatedAt = Date.now();
  next();
});

ProductSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

const Product = model("Product", ProductSchema);

module.exports = Product;
