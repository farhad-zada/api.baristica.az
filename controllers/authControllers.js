const jwt = require("jsonwebtoken");
const {
  secret,
  token_expiration,
  environment,
  cookie_http_only,
} = require("../config");
const { errorResponse, successResponse } = require("../utils/responseHandlers");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const logger = require("../utils/logger");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function login(req, res, next) {
  const { email, password } = req.body.creds;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return errorResponse(res, "User not found!", 404);
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return errorResponse(res, "Invalid password!", 400);
  }
  const token = jwt.sign(
    {
      _id: user._id,
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn: token_expiration }
  );
  res.header("Authorization", `Bearer ${token}`);
  res.cookie("token", token, {
    httpOnly: cookie_http_only,
    secure: environment === "production",
    expires: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000), // 3 months
  });
  return successResponse(res, { token });
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function register(req, res, next) {
  try {
    const userData = req.body.user;
    const user = new User(userData);
    await user.save();
    req.body.creds = { email: user.email, password: userData.password };
    return login(req, res, next);
  } catch (error) {
    logger.error(error);
    return errorResponse(
      res,
      "Something went wrong on our side! Please contact support!",
      500
    );
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
function logout(req, res, next) {
  res.clearCookie("token");
  return successResponse(res, "Logged out successfully!");
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function updatePassword(req, res, next) {
  const { password, passwordConfirm } = req.body.creds;
  if (password !== passwordConfirm) {
    return errorResponse(res, "Passwords do not match!", 400);
  }
  try {
    const user = await User.findById(req.user._id).select("+password");
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
      return errorResponse(res, "New password should be different!", 400);
    }
    user.password = password;
    await user.save();
    req.body.creds = { email: user.email, password };
    return login(req, res, next);
  } catch (error) {
    logger.error(error);
    return errorResponse(
      res,
      "Something went wrong on our side! Please contact support!",
      500
    );
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function forgotPassword(req, res, next) {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return errorResponse(res, "User not found!", 404);
  }
  // send email with reset password link
  return successResponse(res, "Reset password link sent to your email!");
}
module.exports = {
  login,
  register,
  logout,
  updatePassword,
  forgotPassword,
};
