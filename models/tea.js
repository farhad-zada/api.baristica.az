const { Schema, model } = require("mongoose");
const multiLang = require("./multiLang");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const Product = require("./productModel");

const coffeeSchema = new Schema({
  _id: {
    type: String,
    default: function () {
      return `tea_${uuidv4()}`;
    },
  },
  category: {
    type: String,
    required: [true, "A valid category must be provided!"],
    index: true,
    enum: ["tea"],
  },
  weight: {
    type: Number,
    required: true,
    index: true,
    min: 0,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

const Tea = Product.discriminator("Tea", coffeeSchema);

module.exports = Tea;
