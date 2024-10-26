const sharp = require("sharp");
const { ObjectId } = require("mongoose").Types;
const { successResponse } = require("../utils/responseHandlers");
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
    const photoName = `${new ObjectId().toString()}.${extension}`;
    const fileOut = `${__dirname}/../public/images/${photoName}`;

    logger.info("[New Image] " + fileOut);

    sharp(photo.buffer).resize(media.width, media.height).toFile(fileOut);
    const photourl = `https://baristica.az/md/${photoName}`;
    const {originalname} = photo;
    return { originalname, photourl };
  });

  successResponse(res, returns);
};
