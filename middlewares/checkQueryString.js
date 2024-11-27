const { errorResponse } = require("../utils/responseHandlers");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import("express").Request} next
 * @returns {void | import("express").Response | import("express").NextFunction}
 */
const checkQueryString = (req, res, next) => {
  //  pg (page) is integer between 1 and 1000 and can be omitted
  //  lt (limit) is integer between 1 and 100 and can be omitted
  //  s (string contains) is string and can be omitted this string that name, description or about fields may contain
  let { pg, lt, ptp } = req.query;

  if (pg) {
    if (isNaN(pg) || pg < 1 || pg > 20) {
      return errorResponse(res, "Invalid page", 400);
    }
  } else {
    req.query.pg = 1;
  }

  if (lt) {
    if (isNaN(lt) || lt < 5 || lt > 50) {
      return errorResponse(res, "Invalid limit", 400);
    }
  } else {
    req.query.lt = 10;
  }
  console.log(ptp);
  if (ptp) {
    if (
      ![
        "Coffee",
        "Machine",
        "Accessory",
      ].includes(ptp)
    ) {
      return errorResponse(res, "Invalid product type", 400);
    }
  } else {
    ptp = "Coffee";
  }
  req.productType = ptp;

  next();
};

module.exports = checkQueryString;
