const mongoose = require("mongoose");
const mime = require("mime");
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const Product = require("../models/productModel");
const config = require("../config");

// Connect to MongoDB
mongoose
  .connect(config.db_uri(), {})
  .then(async () => {
    console.log("Successfully connected to the database");
    await uploadCoffee();
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
    process.exit(1); // Exit the process with a failure code
  });

async function downloadImage(url, filePath, productId, optionId) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  const contentType = response.headers["content-type"];
  const extension = mime.extension(contentType);
  const writer = fs.createWriteStream(filePath + "." + extension);
  response.data.pipe(writer);

  const image = `https://farhadzada.com/md/${productId}${optionId}.${extension}`;

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(image));
    writer.on("error", reject);
  });
}

const uploadCoffee = async () => {
  const products = await Product.find({
    productType: "coffee",
    options: { $elemMatch: { image: { $regex: /drive.google.com/ } } },
  }).select("options _id");

  console.log(`${products.length} products found.`);
  if (products.length === 0) {
    console.log("No data found.");
    return;
  }

  for (const product of products) {
    const updatedOptions = await Promise.all(
      product.options.map(async (option) => {
        if (/drive.google.com/.test(option.image)) {
          const filePath = `public/images/${product._id}${option._id}`;
          const newImageUrl = await downloadImage(
            option.image,
            filePath,
            product._id,
            option._id
          );
          option.image = newImageUrl;
        }
        return option;
      })
    );

    // Update the product with the new image URLs
    await Product.updateOne(
      { _id: product._id },
      { $set: { options: updatedOptions } }
    );

    console.log(`Product ${product._id} updated.`);
    console.log(updatedOptions);
  }
};
