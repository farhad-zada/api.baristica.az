const { Schema, model } = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const Product = require("./productModel");

const machineSchema = new Schema(
  {
    _id: {
      type: String,
      default: function () {
        return `machine_${uuidv4()}`;
      },
    },
    category: {
      type: String,
      required: [true, "A valid category must be provided!"],
      index: true, 
      enum: ["1_group", "2_group", "3_group", "grinder"],
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

machineSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true }, productType: "machine"});
  next();
});

const Machine = Product.discriminator("Machine", machineSchema);

module.exports = Machine;
