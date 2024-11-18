const mongoose = require("mongoose");
const Favorite = require("../models/favorites");
const Product = require("../models/productModel");
const { errorResponse, successResponse } = require("../utils/responseHandlers");

const populateProducts = async (favorites) => {
  const productCollection = mongoose.connection.collection("products");

  const populatedFavorites = await Promise.all(
    favorites.map(async (fav) => {
      const product = await productCollection.findOne({
        _id: fav.product,
        deleted: false,
      });
      product.favorited = true;
      return product;
    })
  );

  return populatedFavorites;
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description all the favorites products of the user
 */
const allFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }, {product: 1});
    const favoriteProducts = await populateProducts(favorites);
    successResponse(res, favoriteProducts, 200);
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description checks if the product is favorite
 */
const isFavorite = async (req, res) => {
  try {
    const productId = req.params.productId;
    const favorite = await Favorite.findOne({
      user: req.user.id,
      product: productId,
    });
    successResponse(res, {is_favorite: favorite ? true : false});
  } catch (error) {
    errorResponse(res, error, 500);
  }
};
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

module.exports = { addFavorite, removeFavorite, allFavorites, isFavorite };
