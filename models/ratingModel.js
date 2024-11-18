const { Schema, model } = require("mongoose");

const ratingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    product: {
      type: String,
      ref: "products",
      required: true,
      index: true,
    },
    rating: {
        type: Number, 
        required: true, 
        min: 1, 
        max: 5
    }
  },
  {
    timestamps: true,
  }
);

const Rating = model("Rating", ratingSchema);

module.exports = Rating;
