const { Schema, model } = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const Product = require("./productModel");

const accessorySchema = new Schema(
  {
    _id: {
      type: String,
      default: function () {
        return `accessory_${uuidv4()}`;
      },
    },
    category: {
      type: String,
      required: [true, "A valid category must be provided!"],
      index: true, 
      enum: ["barista", "scale", "brewing", "kettle", "tableware"],
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

// accessorySchema.pre(/^find/, function (next) {
//   this.find({ deleted: { $ne: true }, productType: "accessory" });
//   next();
// });


const Accessory = Product.discriminator("Accessory", accessorySchema);

module.exports = Accessory;
