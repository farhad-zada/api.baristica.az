const logger = require("./logger");
/**
 * Sends an error response.
 * @param {import('express').Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - HTTP status code
 */
const errorResponse = (res, message, statusCode = 500) => {
  if (typeof message === "object") {
    message = message.message + "\n" + message.stack;
  }
  logger.error(message);
  if (statusCode === 500) {
    message =
      "Something went wrong. Please try again later or contact support.";
  }
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * Sends a success response.
 * @param {import('express').Response} res - Express response object
 * @param {Object} data - Response data
 * @param {number} [statusCode=200] - HTTP status code
 */
const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

module.exports = {
  errorResponse,
  successResponse,
};
