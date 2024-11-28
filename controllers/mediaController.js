const sharp = require("sharp");
const { successResponse } = require("../utils/responseHandlers");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const {media} = require('../config');
const logger = require("../utils/logger");


/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns {Function}
 */
module.exports = (req, res) => {
  /**
   * @type {Multer.File[]}
   */
  const photos = req.files.photos;

  const returns = photos.map((photo) => {
    const extension = photo.mimetype.split("/")[1];
    const photoName = `${uuidv4()}.${extension}`;
    const fileOut = `${__dirname}/../public/images/${photoName}`;

    logger.info("[New Image] " + fileOut);

    sharp(photo.buffer).resize(media.width, media.height).toFile(fileOut);
    const photourl = `https://api.baristica.az/md/${photoName}`;
    const {originalname} = photo;
    return { originalname, photourl };
  });

  successResponse(res, returns);
};
