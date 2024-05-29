const jwt = require("jsonwebtoken");
const { secret } = require("../config");
const { errorResponse } = require("../utils/responseHandlers");
const User = require("../models/userModel");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").Request} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function authMiddleware(req, res, next) {
  if (!req.header("Authorization")) {
    return errorResponse(res, "Access denied. Sign in required.", 401);
  }
  const token = req.header("Authorization").replace("Bearer ", "");
  if (!token) {
    return errorResponse(res, "Access denied. Sign in required.", 401);
  }

  try {
    const decoded = jwt.verify(token, secret);
    const userId = decoded._id;
    if (!userId) {
      return errorResponse(res, "Invalid token.", 400);
    }
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, "Please sign in!", 404);
    }
    req.user = user;
    next();
  } catch (ex) {
    console.log(ex);
    return errorResponse(res, "Invalid token.", 400);
  }
}

module.exports = authMiddleware;
