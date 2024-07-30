const User = require("../models/userModel");
const logger = require("../utils/logger");
const { successResponse, errorResponse } = require("../utils/responseHandlers");
const validator = require("validator");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function me(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -passwordChangedAt -resetPasswordToken -resetPasswordExpires -__v"
    );
    return successResponse(res, user);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function updateMe(req, res, next) {
  try {
    const { name, lastname, phone, email } = req.body;
    if (phone && !validator.isMobilePhone(phone, "any")) {
      return errorResponse(res, "Invalid phone number!", 400);
    }
    if (email && !validator.isEmail(email)) {
      return errorResponse(res, "Invalid email!", 400);
    }
    const userData = { name, lastname, phone, email };

    const userUpdated = await User.findByIdAndUpdate(req.user._id, userData, {
      new: true,
      runValidators: true,
    }).select("+phone +email +name +role");
    successResponse(res, userUpdated);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
}

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @returns {void | import ('express').Response | import ('express').NextFunction}
 * @description add address for user
 */
const addAddress = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      entrance,
      apartment,
      lat,
      lng,
      notes,
      isPrimary,
    } = req.body;
    const user = req.user;
    user.addresses.push({
      name,
      address,
      city,
      entrance,
      apartment,
      lat,
      lng,
      notes,
    });
    if (isPrimary) {
      user.addresses.forEach((address) => {
        address.isPrimary = false;
      });
      user.addresses[user.addresses.length - 1].isPrimary = true;
    }
    await user.save();
    successResponse(res, user, 201);
  } catch (error) {
    if (error.name === "ValidationError") {
      logger.error(error + "\n" + error.stack);
      return errorResponse(
        res,
        "Invalid input data. Please enter valid data! If you think this is a mistake, please contact us.",
        400
      );
    }
    errorResponse(res, error.message, 500);
  }
};

/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @returns {void | import ('express').Response | import ('express').NextFunction}
 * @description remove address for user
 */
const removeAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = req.user;
    user.addresses = user.addresses.filter(
      (address) => address._id.toString() !== addressId
    );
    await user.save();
    successResponse(res, user, 200);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
module.exports = {
  me,
  updateMe,
  addAddress,
  removeAddress,
};
