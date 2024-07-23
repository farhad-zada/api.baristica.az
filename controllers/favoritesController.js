const mongoose = require("mongoose");
const Favorite = require("../models/favorites");
const Product = require("../models/productModel");

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description Adds a product to the favorites list of the user
 */
const addFavorite = async (req, res) => {
  try {
    const productId = req.params.productId;

    const newFavorite = new Favorite({
      user: req.user.id,
      product: productId,
    });

    await newFavorite.save();
    successResponse(res, newFavorite, 201);
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description Removes a product from the favorites list of the user
 */
const removeFavorite = async (req, res) => {
  try {
    const productId = req.params.productId;
    const favorite = await Favorite.deleteOne(
      {
        user: req.user.id,
        product: productId,
      },
      { new: true }
    );
    successResponse(res, favorite, 200);
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

module.exports = { addFavorite, removeFavorite };
