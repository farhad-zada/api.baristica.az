const mongoose = require("mongoose");
const { v4: uuidv4, validate } = require("uuid");
const slugify = require("slugify");

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
    price: {
      type: Number,
      required: true,
      min: [0, "There must be a valid price"],
    },
    weight: {
      type: Number,
      min: [0, "There must be a valid weight"],
    },
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
    image: {
      type: String,
      // required: true, TODO: uncomment after adding images
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
    slug: {
      type: String,
      // unique: true,
      index: true,
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
