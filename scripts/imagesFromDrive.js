const { google } = require("googleapis");
const mongoose = require("mongoose");
const config = require("../config");
const mime = require("mime");
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const Product = require("../models/productModel");

// connect mongoDB
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

async function downloadImage(url, filePath, id) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  const contentType = response.headers["content-type"];
  const extension = mime.extension(contentType);
  const writer = fs.createWriteStream(filePath + "." + extension);
  response.data.pipe(writer);

  const image = `https://farhadzada.com/md/${id}.${extension}`;

  return [
    new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    }),
    Product.updateOne({ _id: id }, { image }),
  ];
}

const uploadCoffee = async () => {
  // image is like 'https://drive.google.com/uc?id=
  const products = await Product.find({
    productType: "coffee",
    image: { $regex: /drive.google.com/ },
  }).select("image _id");
  console.log(`${products.length} products found.`);
  if (products.length === 0) {
    console.log("No data found.");
    return;
  }
  if (products.length) {
    console.log(`<<<<Coffee>>>>`);
    const promisesTuple = products.map(async (product) => {
      const url = product.image;
      const filePath = `public/images/${product._id}`;

      return downloadImage(url, filePath, product._id);
    });

    const promisesDownloadImage = promisesTuple.map((promise) => promise[0]);
    const promisesSaveToDB = promisesTuple.map((promise) => promise[1]);

    await Promise.all(promisesDownloadImage);
    await Promise.all(promisesSaveToDB);
  } else {
    console.log("No data found.");
  }
};
