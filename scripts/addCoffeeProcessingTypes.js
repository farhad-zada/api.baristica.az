const mongoose = require("mongoose");
const config = require("../config");
const Product = require("../models/productModel");
const CoffeeProcessingType = require("../models/coffeeProcessingType");

const en = [
  "⁠For a cup",
  "For a cezve",
  "For a French press",
  "For a Batch brew",
  "For a Chemex",
  "For a pour-over",
  "For an AeroPress",
  "For a Moka pot",
  "For espresso",
  "In beans",
];

const az = [
  "⁠Fincan üçün",
  "Cezvə üçün",
  "French press üçün",
  "Batch brew üçün",
  "Chemex üçün",
  "Pour-over üçün",
  "AeroPress üçün",
  "Moka pot üçün",
  "Espresso üçün",
  "Dənəcik",
];

const ru = [
  "Для чашки",
  "Для турки",
  "Для френч пресса",
  "Для капельной кофеварки",
  "Для кемекса",
  "Для пуровера",
  "Для аэропресса",
  "Для гейзерной кофеварки",
  "Для эспрессо",
  "В зёрнах",
];

mongoose
  .connect(config.db_uri())
  .then(async () => {
    console.log("\x1b[33mConnected to DB!\x1b[0m");
    await CoffeeProcessingType.deleteMany();

    const coffeeProcessingTypes = [];

    for (let i = 0; i < en.length; i++) {
      const coffeeProcessingType = await CoffeeProcessingType.create({
        name: {
          en: en[i],
          az: az[i],
          ru: ru[i],
        },
        description: "",
      });
      coffeeProcessingTypes.push(coffeeProcessingType);
    }
    console.log("\x1b[32mCoffee processing types created!\x1b[0m");
    const products = await Product.find();

    for (const product of products) {
      product.coffeeProcessingTypes = coffeeProcessingTypes;
      await product.save({});
    }
    console.log("\x1b[32mCoffee processing types added to products!\x1b[0m");
    console.log("\x1b[32mDone!\x1b[0m");
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
  });

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! Shutting down...");
  process.exit(1);
});
