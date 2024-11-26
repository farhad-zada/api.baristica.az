const { errorResponse } = require("../utils/responseHandlers");
const logger = require("../utils/logger");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").Request} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Not logged in!", 403);
    } else if (!user.role) {
      return errorResponse(res, "User roles are not defined!", 403);
    } else if (!roles.includes(req.user.role)) {
      logger.error("Unauthorized access");
      return errorResponse(res, `Unauthorized access. User's role ${req.user.role} do not have the previleges to proceed this action!`, 403);
    }
    next();
  };
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").Request} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
const allowTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Not logged in!", 403);
    } else if (!req.user.role) {
      return errorResponse(res, "User roles are not defined!", 403);
    } else if (!roles.includes(req.user.role)) {
      logger.error("Unauthorized access");
      return errorResponse(res, "Unauthorized access. User's role do not have the previleges to proceed this action!", 403);
    }
    next();
  };
};

module.exports = { restrictTo, allowTo };
