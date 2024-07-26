const fs = require("fs");
const sharp = require("sharp");
require("dotenv").config();

const resizeImage = async (path, id) => {
  const inputPath = `${path}/${id}`;
  const outputPath = `${path}/${id}-thumb.png`;
  console.log(`Resizing ${inputPath}...`);
  const imageSizeX = process.env.IMAGE_SIZE * 1 || 800;
  const imageSizeY = process.env.IMAGE_SIZE * 1 || 800;
  await sharp(inputPath).resize(imageSizeX, imageSizeY).toFile(outputPath);
};

const resizeImages = async () => {
  const images = fs.readdirSync("public/images");

  for (const image of images) {
    await resizeImage(`${__dirname}/../public/images/`, image);
  }
};

resizeImages();
