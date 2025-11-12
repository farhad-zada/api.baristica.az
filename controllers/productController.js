const { successResponse, errorResponse } = require("../utils/responseHandlers");
const Favorite = require("../models/favorites");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const humanReadableError = require("../utils/humanReadableError");
const Coffee = require("../models/coffee");

const directions = { asc: 1, desc: -1 };
const levels = { low: [1, 2], medium: [3], high: [4, 5] };
const coffeeTypes = {
  "bright espresso": {
    acidity: { $in: [...levels.high, ...levels.medium] },
    category: { $in: ["espresso"] },
  },
  "balanced espresso": {
    acidity: { $in: levels.low },
    category: { $in: ["espresso"] },
  },
  "bright filter": {
    acidity: { $in: levels.high },
    category: { $in: ["filter"] },
  },
  "balanced filter": {
    acidity: { $in: levels.low },
    category: { $in: ["filter"] },
  },
};
function sortProducts(query, field, direction) {
  if (direction && direction in directions) {
    query = query.sort({ [field]: directions[direction] });
  }
  return query;
}
function findInLevels(query, field, splittable) {
  if (splittable) {
    let vals = splittable
      .split(",")
      .map((splt) => {
        if (splt in levels) {
          return levels[splt];
        }
      })
      .filter((val) => val !== null && val !== undefined)
      .flat();

    query = query.find({ [field]: { $in: vals } });
  }
  return query;
}
function findIn(query, field, splittable) {
  if (splittable) {
    let vals = splittable.split(",");
    query = query.find({ [field]: { $in: vals } });
  }
  return query;
}
function setProductLinked(product) {
  if (product.linked_ids && product.linked_ids.length > 0) {
    product.linked_ids.forEach((link) => {
      link.data.forEach((d) => {
        product.linked.push({
          product: d.product,
          field: link.field,
          fieldValue: d.value,
        });
      });
    });
    delete product.linked_ids;
  }
}

const findTeas = async (req, res) => {
  try {
    const Tea = req.Model;

    let teas = await Tea.find({ deleted: false, weight: 100 }).populate(
      "linked_ids"
    );
    for (let tea of teas) {
      setProductLinked(tea);
    }

    successResponse(res, teas, 200, 1, 1);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const findAll = async (req, res) => {
  try {
    const Model = req.Model;
    if (req.productType === "Tea") {
      return findTeas(req, res);
    }
    let {
      pg,
      lt,
      qGrader,
      rating,
      processingMethod,
      acidity,
      viscocity,
      country,
      price,
      coffeeType,
      category,
    } = req.query; // Accept 'keys' as a query parameter for multiple sorting fields
    const skip = (pg - 1) * lt;

    let query = Model.find();

    if (!category) {
      if (req.productType === "Machine") {
        category = "1_group,2_group,grinder";
      }
    }
    query = sortProducts(query, "price", price);
    query = sortProducts(query, "statistics.ratings", rating);
    query = sortProducts(query, "qGrader", qGrader);
    query = sortProducts(query, "code", "asc");
    query = findInLevels(query, "viscocity", viscocity);
    query = findInLevels(query, "acidity", acidity);
    query = findIn(query, `processingMethod.az`, processingMethod);
    query = findIn(query, "country", country);
    query = findIn(query, "category", category);
    if (coffeeType) {
      const coffeeTypeFilters = coffeeType
        .split(",")
        .map((value) => coffeeTypes[value])
        .filter(Boolean); // Remove undefined values

      if (coffeeTypeFilters.length > 0) {
        query = query.find({
          $or: coffeeTypeFilters.map((filter) => ({ ...filter })), // Spread each filter
        });
      }
    }

    if (req.productType === "Coffee") {
      query = query
        .find({
          $or: [
            { category: "espresso", weight: 1000 },
            { code: "E20010" },
            { code: "E20012" },
            { category: "filter", weight: 200 },
            { category: "filter", weight: 100 },
            { category: "drip", weight: 20 },
            { category: "tea", weight: 100 }
          ],
        })
        .sort("category");
    }

    const count = await Model.countDocuments(query.getFilter());
    const products = await query
      .populate("linked_ids")
      .skip(skip)
      .limit(lt)
      .lean();
    for (let product of products) {
      setProductLinked(product);
    }

    if (req.user !== undefined) {
      const favorites = await Favorite.find({
        user: req.user.id,
        product: { $in: products.map((prod) => prod._id) },
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
    const pagesCount = Math.ceil(count / lt);
    successResponse(res, products, 200, count, pagesCount);
  } catch (error) {
    console.log(error);
    errorResponse(res, error, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const findById = async (req, res) => {
  try {
    const Model = req.Model;
    const productId = req.params.id;
    const product = await Model.findById(productId)
      .populate("linked_ids")
      .lean();
    if (!product) {
      return errorResponse(res, "No product found for the ID provided!", 404);
    }

    setProductLinked(product);
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
    const Model = req.Model;
    const id = `${req.body.productType.toLowerCase()}_${uuidv4()}`;
    req.body.product._id = id;
    const product = await Model.create(req.body.product);
    // await product.save();
    successResponse(res, { product });
  } catch (error) {
    console.log(error);
    errorResponse(res, erorr, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
const updateProduct = async (req, res) => {
  try {
    const Model = req.Model;
    const productId = req.params.id;
    const productUpdated = await Model.findByIdAndUpdate(
      productId,
      req.body.product,
      { runValidators: true, new: true }
    );
    if (!productUpdated) {
      return errorResponse(res, "Not product found for the ID provided!", 404);
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
    const Model = req.Model;
    const productId = req.params.id;
    const productDeleted = await Model.findByIdAndUpdate(productId, {
      deleted: true,
      deletedAt: Date.now(),
    });

    if (!productDeleted) {
      return errorResponse(res, "No product found for ID provided!", 404);
    }
    successResponse(res, "Product deleted successfully");
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @description everything is already verified and validated by the time it gets here
 */
async function getProcessingMethods(req, res) {
  try {
    const az = await Coffee.distinct("processingMethod.az");
    const ru = await Coffee.distinct("processingMethod.ru");
    return successResponse(res, {
      processingMethods: {
        az,
        ru,
      },
    });
  } catch (e) {
    console.error(e);
    return errorResponse(res, "Something went wrong!", 500);
  }
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  findAll,
  findById,
  getProcessingMethods,
};
