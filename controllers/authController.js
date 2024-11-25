const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const validator = require("validator");
const sendEmail = require("../utils/sendMail");
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
async function login(req, res) {
  const { email, password } = req.body.creds ?? {};
  if (!email | !password) {
    return errorResponse(res, "Bad request", 400);
  }
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
  const expires = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000); // 3 months
  res.cookie("token", token, {
    httpOnly: cookie_http_only,
    secure: environment === "production",
    expires, // 3 months,
    sameSite: "none",
  });
  res.cookie("logged-in", true, {
    expires, // 3 months
    sameSite: "none",
  });
  res.cookie("farhad-zada", JSON.stringify({ name: "Farhad Seyfullazada" }), {
    expire: new Date(Date.now() + 10 * 12 * 30 * 24 * 60 * 60 * 1000), // 10 years
  });

  user.password = undefined;
  user.passwordConfirm = undefined;
  
  return successResponse(res, { token, user }, 200);
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
  res.clearCookie("logged-in");
  return successResponse(res, "Logged out successfully!", 200);
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function updatePassword(req, res, next) {
  const { oldPassword, password, passwordConfirm } = req.body.creds ?? {};
  if (!oldPassword) {
    return errorResponse(res, "'oldPassword' password is required!", 400);
  }
  if (password !== passwordConfirm) {
    return errorResponse(res, "'password' and 'passwordConfirm' do not match!", 400);
  }
  try {
    const user = await User.findById(req.user._id).select("+password");
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (passwordIsValid) {
      return errorResponse(res, "New password should be different!", 400);
    }
    user.password = password;
    await user.save();
    req.body.creds = { email: user.email, password };
    return login(req, res, next);
  } catch (error) {
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
  try {
    const { email } = req.body;
    if (!validator.isEmail(email)) {
      return errorResponse(res, "Invalid email!", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, "User not found!", 404);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000 * 24; // 10 minutes
    await user.save();

    // send email with reset password link
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/reset-password/${resetToken}`;

    const to = email;

    const subject = "Baristica ⚙️ Reset Password";

    const text = `Click to reset your password`;

    await sendEmail({
      to,
      subject,
      text,
      link: resetURL,
    }, null);

    return successResponse(res, "Reset password link sent to your email!", 200);
  } catch (error) {
    return errorResponse(res, error, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").NextFunction} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body.creds ?? {};

    if (password.length < 8 || passwordConfirm.length < 8) {
      return errorResponse(
        res,
        "Password should be at least 8 characters!",
        400
      );
    }
    if (password !== passwordConfirm) {
      return errorResponse(res, "Passwords do not match!", 400);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+email");

    if (!user) {
      return errorResponse(res, "Url is invalid or has expired!", 400);
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();
    req.body.creds = { email: user.email, password };
    return login(req, res, next);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

module.exports = {
  login,
  register,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
};
