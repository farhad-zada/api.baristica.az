const User = require("../models/userModel");
const { errorResponse } = require("../utils/responseHandlers");
const validator = require("validator");
/**
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 * @param {import ('express').NextFunction} next
 */
const validateNewUserMiddleware = async (req, res, next) => {
  try {
    const { email, password, passwordConfirm, name, lastname, phone, image } =
      req.body.user;
    if (!validator.isEmail(email)) {
      throw new Error("Invalid email");
    }
    const user = await User.findOne({ email: req.body.user.email });
    if (user) {
      throw new Error("User with this email already exists!");
    }
    if (password !== passwordConfirm) {
      throw new Error("Passwords do not match!");
    } else if (password.length < 8) {
      throw new Error("Password should be at least 8 characters long");
    }
    if (!name || !validator.isAlpha(name)) {
      throw new Error("Name is required and should be alphabetic");
    }
    if (!phone || !validator.isMobilePhone(phone, "any")) {
      throw new Error("Phone is required");
    }
    if (lastname && !validator.isAlpha(lastname)) {
      throw new Error("Lastname should be alphabetic");
    }

    req.body.user = { email, password, name, lastname, phone, passwordConfirm };
    req.body.user.role = "default";
    next();
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  validateNewUserMiddleware,
};
