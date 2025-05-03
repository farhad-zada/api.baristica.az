/**
 * Determines the product type based on the product ID.
 * 
 * @param {String} id - The ID of the product.
 * @returns {String} The type of the product (either "Coffee", "Accessory", or "Machine").
 * @throws {Error} Throws an error if the product ID doesn't match any known type.
 */
function findProductTypeFromId(id) {
  if (id.startsWith("coffee")) {
    return "Coffee";
  } else if (id.startsWith("accessory")) {
    return "Accessory";
  } else if (id.startsWith("machine")) {
    return "Machine";
  } else if (id.startsWith("tea")) {
    return "Tea";
  } else {
    throw new Error("Unknown product type!");
  }
}


module.exports = findProductTypeFromId;