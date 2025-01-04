const { Schema, model } = require("mongoose");
const multiLang = require("./multiLang");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const Product = require("./productModel");

const coffeeFeature = {
  type: Number,
  min: 0,
  max: 100,
  required: true,
  index: true,
  _id: false,
};

const coffeeSchema = new Schema(
  {
    _id: {
      type: String,
      default: function () {
        return `coffee_${uuidv4()}`;
      },
    },
    category: {
      type: String,
      required: [true, "A valid category must be provided!"],
      index: true, 
      enum: ["espresso", "filter"],
    },
    profile: multiLang,
    viscocity: coffeeFeature,
    sweetness: coffeeFeature,
    acidity: coffeeFeature,
    qGrader: coffeeFeature,
    country: {
      type: String,
      required: true,
      index: true,
    },
    processingMethod: {
      type: String,
      required: true, 
      index: true, 
      enum: ["washed", "natural", "anaerobic washed", "carbonic maceration"]
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
  },
);



const Coffee = Product.discriminator("Coffee", coffeeSchema);

module.exports = Coffee;
