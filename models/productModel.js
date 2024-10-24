const mongoose = require("mongoose");
const slugify = require("slugify");
const { validate } = require("./orderModel");

const { Schema, model } = mongoose;

const multiLang = {
  en: {
    type: String,
    required: true,
  },
  ru: {
    type: String,
    required: true,
  },
  az: {
    type: String,
    required: true,
  },
  _id: false,
};

const option = {
  // this needs to be in grams
  weight: {
    type: Number,
    min: [0, "There must be a valid weight"],
  },
  image: {
    type: String,
  },
  // this needs to be in kopeks
  price: {
    type: Number,
    required: true,
    min: [0, "There must be a valid price"],
  },
};

const ProductSchema = new Schema(
  {
    name: {
      type: multiLang,
      required: true,
    },
    description: {
      type: multiLang,
      required: false,
    },

    about: {
      type: multiLang,
      required: false,
    },
    processingType: {
      type: multiLang,
      required: false,
    },
    coffeeProcessingTypes: [
      {
        type: Schema.Types.ObjectId,
        ref: "CoffeeProcessingType",
      },
    ],
    region: {
      type: String,
      required: false,
    },
    brewingMethod: {
      type: {
        en: [String],
        ru: [String],
        az: [String],
      },
    },
    options: [option],
    height: {
      type: String,
    },
    qGrader: {
      type: Number,
      min: [0, "There must be a valid Q-Grader"],
    },
    acidity: {
      type: Number,
      min: [0, "There must be a valid acidity"],
    },
    viscosity: {
      type: Number,
      min: [0, "There must be a valid viscosity"],
    },
    sweetness: {
      type: Number,
      min: [0, "There must be a valid sweetness"],
    },
    roastingTemperature: {
      type: Number,
    },
    roastingTime: {
      type: Number,
    },
    roastingLevel: {
      type: [String],
      required: false,
      validate: {
        validator: () => true,
        message: "There must be 3 roasting levels",
      },
    },

    discount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    productType: {
      type: String,
      enum: [
        "coffee",
        "accessory",
        "grinder",
        "grinder-commandate",
        "coffee-machine",
      ],
      required: true,
      index: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    ratings: {
      type: Number,
      default: 0,
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

ProductSchema.index("$**", "text");

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
