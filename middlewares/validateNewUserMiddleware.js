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
    if (!req.body.creds) {
      return errorResponse(res, "`creds` field is not provided!", 400);
    }
    const { email, password, passwordConfirm, name, lastname, phone, image } =
      req.body.creds;
    console.log(1);
    if (!validator.isEmail(email)) {
      errorResponse(res, "Email is not valid!", 400);
    }
    const user = await User.findOne({ email: email });
    if (user) {
      return errorResponse(res, "Email already used!", 400);
    }
    if (password !== passwordConfirm) {
      return errorResponse(res, "'password' and 'password confirmation' do not match!", 400);
    } else if (password.length < 8) {
      return errorResponse(res, "Password should be at least 8 characters", 400);
    }
    if (!name) {
      return errorResponse(res, "Name is required!", 400);
    }
    if (!phone) {
      return errorResponse(res, "Phone is not provided", 400);
    }
    if (!validator.isMobilePhone(phone, "any")) {
      return errorResponse(res, "Phone is not valid!", 400);
    }
    if (lastname ) {
      return errorResponse(res, "Last name should be provided", 400);
    }

    req.body.user = {
      email,
      password,
      name,
      lastname,
      phone,
      passwordConfirm,
      image,
    };
    req.body.user.role = "default";
    next();
  } catch (error) {
    errorResponse(res, error, 400);
  }
};

module.exports = {
  validateNewUserMiddleware,
};
