const Accessory = require("../models/accessory");
const Coffee = require("../models/coffee");
const Machine = require("../models/machine");

/**
 *
 * @param {String} id
 * @returns {Coffee | Accessory | Machine | null}
 */
function findProductModelFromId(id) {
  if (id.startsWith("coffee")) {
    return Coffee;
  } else if (id.startsWith("accessory")) {
    return Accessory;
  } else if (id.startsWith("machine")) {
    return Machine;
  } else {
    throw new Error("Unknown product type!");
  }
}

module.exports = findProductModelFromId;