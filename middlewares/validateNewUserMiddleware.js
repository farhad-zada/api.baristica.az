const User = require("../models/userModel");
const { errorResponse } = require("../utils/responseHandlers");
/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const validateNewUserMiddleware = async (req, res, next) => {
  try {
    req.body.user = await User.validate(req.body.user);
    const user = await User.findOne({ email: req.body.user.email });
    if (user) {
      throw new Error("User with this email already exists!");
    }
    next();
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  validateNewUserMiddleware,
};
