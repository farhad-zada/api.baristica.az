const User = require("../models/userModel");
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
      "+phone +email +name +role"
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
    const { name, lastname, phone } = req.body;
    if (phone && !validator.isMobilePhone(phone, "any")) {
      return errorResponse(res, "Invalid phone number!", 400);
    }
    const userData = { name, lastname, phone };
    const userUpdated = await User.findByIdAndUpdate(req.user._id, userData, {
      new: true,
      runValidators: true,
    }).select("+phone +email +name +role");
    successResponse(res, userUpdated);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
}

module.exports = {
  me,
  updateMe,
};
