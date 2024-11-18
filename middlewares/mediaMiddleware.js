const multer = require("multer");
const { errorResponse } = require("../utils/responseHandlers");
const {media} = require("../config");

const upload = multer({
  //   dest: `${__dirname}/../public/images`,
  limits: {
    fileSize: media.fileSize,
    fieldNameSize: media.fieldNameSize,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      return cb(null, true);
    } else {
      return cb(new Error("Only images are allowed!"), false);
    }
  },
}).fields([{ name: "photos", maxCount: 10}]);

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return errorResponse(res, err.message, 400);
    }

    const files = req.files;
    if (!files || !files.photos || files.photos.length === 0) {
      return errorResponse(
        res,
        "No image files found in the request body!",
        400
      );
    }

    next();
  });
};
