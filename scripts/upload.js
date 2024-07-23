const { google } = require("googleapis");
const mongoose = require("mongoose");
const Product = require("../models/productModel");
const config = require("../config");
require("dotenv").config();

// connect mongoDB
mongoose
  .connect(config.db_uri(), {})
  .then(async () => {
    console.log("Successfully connected to the database");
    // await uploadCommons("Grinder Commandate", "A2:G100", "grinder-commandate");
    // await uploadCommons("Grinder", "A2:G100", "grinder");
    // await uploadCommons("Coffee Machine", "A2:G100", "coffee-machine");
    await uploadCoffee();
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
    process.exit(1); // Exit the process with a failure code
  });

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

const upload = async (data) => {
  try {
    await Product.deleteMany({ productType: data[0].productType });
    await Product.insertMany(data);
    console.log("Data inserted successfully.");
  } catch (err) {
    console.error(err);
  }
};

const uploadCommons = async (sheet, range, productType) => {
  const rows = await getRows(sheet, range);
  let data = [];
  if (rows.length) {
    console.log(`<<<<${productType}>>>>`);
    rows.map((row) => {
      console.log(
        `\x1b[31m${row[0]},\x1b[32m ${row[1]}, \x1b[33m${row[2]}, \x1b[34m${row[3]}\x1b[0m`
      );
      data.push({
        name: {
          en: row[0],
          ru: row[0],
          az: row[0],
        },
        price: row[1],
        discount: row[2],
        discountType: row[3],
        about: {
          en: row[4],
          ru: row[5],
          az: row[6],
        },
        productType,
      });
    });
    await upload(data);
  } else {
    console.log("No data found.");
  }
};

const uploadCoffee = async () => {
  const rows = await getRows("Coffee", "A2:Z100");
  let data = [];
  if (rows.length) {
    console.log(`<<<<Coffee>>>>`);
    rows.map((row) => {
      // console.log(
      //   `\x1b[31m${row[0]},\x1b[32m ${row[1]}, \x1b[33m${row[2]}, \x1b[34m${row[3]}\x1b[0m`
      // );
      const optionsArray = JSON.parse(row[4]);
      const options = [];
      optionsArray.forEach((option) => {
        options.push({
          price: option[0],
          weight: option[1],
        });
      });
      data.push({
        name: {
          en: row[0],
          ru: row[0],
          az: row[0],
        },
        options,
        discount: row[2] * 1,
        discountType: row[3],
        roastingLevel: row[5].split(",").map((word) => word.trim()),
        region: row[6],
        processingMethod: {
          en: row[7],
          ru: row[8],
          az: row[9],
        },
        height: row[10],
        qGrader: row[11],
        beweringMethod: {
          en: row[12].split(",").map((word) => word.trim()),
          ru: row[12].split(",").map((word) => word.trim()),
          az: row[12].split(",").map((word) => word.trim()),
        },
        acidity: row[13],
        viscosity: row[14],
        sweetness: row[15],
        description: {
          az: row[16],
          ru: row[17],
          en: row[18],
        },
        about: {
          en: row[21],
          ru: row[20],
          az: row[19],
        },
        image: `https://drive.google.com/uc?id=${row[23]}`,

        productType: "coffee",
      });
    });
    await upload(data);
  } else {
    console.log("No data found.");
  }
};
