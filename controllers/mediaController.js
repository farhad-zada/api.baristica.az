const sharp = require("sharp");
const { successResponse, errorResponse } = require("../utils/responseHandlers");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const { media } = require("../config");
const fs = require("fs")
const logger = require("../utils/logger");
const path = require("path");

async function listImages(req, res) {
  // list all the pictures in the /public/images folder
  try {
    let imagesDir = path.join(__dirname, "..", "public", "images");
    let files = fs.readdirSync(imagesDir);
    let imagePaths = files.map(f => {
      return { [f]: `https://api.baristica.az/md/${f}` }
    });
    successResponse(res, {  imagePaths }, 200);
  } catch (error) {
    logger.error(error)
    errorResponse(res, "something went wrong", 500)
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Function}
 */
async function storeMedia (req, res) {
  /**
   * @type {Multer.File[]}
   */
  const photos = req.files.photos;

  const returns = photos.map((photo) => {
    const extension = photo.mimetype.split("/")[1];
    const photoName = `${uuidv4()}.${extension}`;
    const fileOut = `${__dirname}/../public/images/${photoName}`;

    logger.info("[New Image] " + fileOut);

    if (extension === "png") {
      sharp(photo.buffer)
        .resize(media.width, media.height)
        .png({ force: true })
        .toFile(fileOut);
    } else {
      sharp(photo.buffer).resize(media.width, media.height).toFile(fileOut);
    }
    const photourl = `https://api.baristica.az/md/${photoName}`;
    const { originalname } = photo;
    return { originalname, photourl };
  });

  successResponse(res, returns);
};

module.exports = {
  storeMedia, 
  listImages
}
