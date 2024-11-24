const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const findProductModelFromType = require("../utils/findProductModelFromType");
const findProductTypeFromId = require("../utils/findProductTypeFromId");
const logger = require("../utils/logger");
const { errorResponse, successResponse } = require("../utils/responseHandlers");

// 1. check product exists
// 2. check is not in the cart already if yess then only update the quantity

/**
 * add a new item to cart
 * @param {import ("express").Request} req
 * @param {import ("express").Response} res
 */
async function index(req, res) {
  try {
    /**
     * @type {String}
     */
    const customer = req.user.id;
    const items = await Cart.find({ customer }).limit(300).populate("product");
    return successResponse(res, { items }, 200);
  } catch (error) {
    logger.error(error);
    return errorResponse(res, "Bad request!", 400);
  }
}

async function findByProductId(req, res) {
  try {
    const productId = req.params.id;
    const customer = req.user.id;

    const item = await Cart.findOne({
      product: productId,
      customer,
    }).populate("product");
    return successResponse(res, { item }, 200);
  } catch (error) {
    logger.error(error);
    return errorResponse(res, "Bad request!", 400);
  }
}

/**
 * add a new item to cart
 * @param {import ("express").Request} req
 * @param {import ("express").Response} res
 */
async function addToCart(req, res) {
  try {
    /**
     * @typedef {Object} _Product
     * @property {String} id
     * @property {Number} quantity
     */

    /**
     * @type {_Product}
     */
    const { id, quantity } = req.body.product;

    if (!id | !quantity) {
      logger.error(
        "`id` and `quantity` is required!" + ` id: ${id}, quantity: ${quantity}`
      );
      return errorResponse(res, "Bad request!", 400);
    }

    const productType = findProductTypeFromId(id);

    const customer = req.user.id;
    let cartItem = await Cart.findOne({ customer, product: id });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = new Cart({
        customer,
        product: id,
        quantity,
        productType,
      });
    }

    await cartItem.save();

    protectFromInvalidProduct(id, cartItem.id);
    return successResponse(res, { item: cartItem }, 201);
  } catch (error) {
    return errorResponse(res, error, 500);
  }
}

/**
 * remove am item from the cart
 * @param {import ("express").Request} req
 * @param {import ("express").Response} res
 */
async function removeFromCart(req, res) {
  try {
    /**
     * @type {String}
     */
    const product = req.params.id;

    /**
     * @type {String}
     */
    const customer = req.user.id;

    if (!product | !customer) {
      return errorResponse(res, "Bad request!", 400);
    }
    await Cart.findOneAndDelete({ product, customer });
    return successResponse(res, {
      message: "Successfully deleted the item from the cart!",
    });
  } catch (error) {
    return errorResponse(res, error, 500);
  }
}

/**
 * update the quanrity of an item in the cart
 * @param {import ("express").Request} req
 * @param {import ("express").Response} res
 */
async function requantify(req, res) {
  try {
    /**
     * @type {String}
     */
    const product = req.params.id;

    /**
     * @type {String}
     */
    const customer = req.user.id;

    /**
     * @type {Number}
     */
    const quantity = req.body.quantity;

    if (quantity <= 0) {
        return errorResponse(res, "quantity can't be lower than 1", 400);
    }

    const item = await Cart.findOneAndUpdate(
      { customer, product },
      { quantity },
      { new: true }
    );

    return successResponse(res, {
      item,
    });
  } catch (error) {
    return errorResponse(res, error, 500);
  }
}

async function protectFromInvalidProduct(productId, cartItemId) {
  try {
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      await Cart.findByIdAndDelete(cartItemId);
    }
  } catch (error) {
    logger.error(error);
  }
}

module.exports = {
  index,
  findByProductId,
  addToCart,
  removeFromCart,
  requantify,
};
