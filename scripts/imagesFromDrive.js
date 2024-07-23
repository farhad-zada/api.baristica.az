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

async function downloadImage(url, filePath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  const contentType = response.headers["content-type"];
  const extension = mime.extension(contentType);
  const writer = fs.createWriteStream(filePath + "." + extension);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

const getRows = async (sheet, range) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: process.env.SCOPES,
  });

  const client = await auth.getClient();
  const spreadsheetId = process.env.SPREADSHEET_ID;

  const sheets = google.sheets({ version: "v4", auth: client });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheet}!${range}`,
  });

  return response.data.values;
};

const uploadCoffee = async () => {
  const products = await Product.find({ productType: "coffee" }).select(
    "image"
  );

  let data = [];
  if (products.length) {
    console.log(`<<<<Coffee>>>>`);
    const promises = products.map(async (product) => {
      const url = product.image;
      const filePath = `public/images/${product._id}`;
      return downloadImage(url, filePath);
    });

    const images = await Promise.all(promises);
    console.log(images);
  } else {
    console.log("No data found.");
  }
};
