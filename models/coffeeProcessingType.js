const mongoose = require("mongoose");

const coffeeProcessingTypeSchema = new mongoose.Schema({
  name: {
    az: String,
    en: String,
    ru: String,
    _id: false,
  },
  description: {
    type: String,
  },
});

const CoffeeProcessingType = mongoose.model(
  "CoffeeProcessingType",
  coffeeProcessingTypeSchema
);

module.exports = CoffeeProcessingType;
