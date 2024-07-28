const { successResponse, errorResponse } = require("../utils/responseHandlers");
const Product = require("../models/productModel");
const Favorite = require("../models/favorites");

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const allProducts = async (req, res) => {
  try {
    let { pg, lt, ptp, key } = req.query;
    const skip = (pg - 1) * lt;

    if (key === "new") {
      key = "createdAt";
    } else if (key === "popular") {
      key = "sold";
    } else {
      key = "createdAt";
    }
    const products = await Product.find(ptp ? { productType: ptp } : {})
      .sort({ [key]: -1 })
      .skip(skip)
      .limit(lt)
      .lean();

    if (req.user !== undefined) {
      const favorites = await Favorite.find({
        user: req.user.id,
        product: { $in: products },
      });
      products.forEach((product) => {
        const found = favorites.find((fav) => {
          return fav.product.toString() === product._id.toString();
        });
        if (found) {
          product.favorited = true;
        } else {
          product.favorited = false;
        }
      });
    }

    successResponse(res, products, 200);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const productById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).lean();
    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    if (req.user !== undefined) {
      const favorite = await Favorite.findOne({
        user: req.user.id,
        product: productId,
      });
      product.favorited = favorite ? true : false;
    }
    successResponse(res, product);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body.product);
    await product.save();
    successResponse(res, product);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productUpdated = await Product.findByIdAndUpdate(
      productId,
      req.body.product,
      { runValidators: true, new: true }
    );
    if (!productUpdated) {
      return errorResponse(res, "Product not found", 404);
    }
    successResponse(res, productUpdated);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productDeleted = await Product.findByIdAndUpdate(productId, {
      deleted: true,
      deletedAt: Date.now(),
    });

    if (!productDeleted) {
      return errorResponse(res, "Product not found", 404);
    }
    successResponse(res, "Product deleted successfully");
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  allProducts,
  productById,
};
