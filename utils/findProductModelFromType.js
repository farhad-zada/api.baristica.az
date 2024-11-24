const Accessory = require("../models/accessory");
const Coffee = require("../models/coffee");
const Machine = require("../models/machine");

/**
 * Determines the product model based on the product type.
 *
 * @param {String} productType - The type of the product (either "Coffee", "Accessory", or "Machine").
 * @returns {Coffee | Accessory | Machine} The model corresponding to the product type.
 * @throws {Error} Throws an error if the product type doesn't match any known type.
 */
function findProductModelFromType(productType) {
  const productModels = {
    Coffee: Coffee,
    Accessory: Accessory,
    Machine: Machine,
  };
  console.log(productType);
  if (productModels[productType]) {
    return productModels[productType];
  } else {
    throw new Error("Unknown product type!");
  }
}

module.exports = findProductModelFromType;
