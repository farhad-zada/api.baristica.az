const mongoose = require("mongoose");
const Coffee = require("../models/coffee");
const config = require("../config");

const processingMethods = {
  Yuyulmuş: "washed",
  Təbii: "natural",
  "Karbonik maserasiya": "carbonic maceration",
  "Təbii anaerobik": "anaerobic washed",
};

let coffee;

mongoose
  .connect(config.db_uri())
  .then(async function (value) {
    let coffees = await Coffee.find();

    for (coffee of coffees) {
      for (let attr of coffee.attributes) {
        if (attr.name.az == "Q-qreyder dəyəri") {
          coffee.qGrader = attr.value.az;
        }

        if (attr.name.az == "Emal üsulu") {
          coffee.processingMethod = processingMethods[attr.value.az];
        }
      }
      await coffee.save();
      console.log(`\x1b[33m${coffee.id} \x1b[32mCoffee saved successfully!`);
    }
    console.log("Updated successfully!");
    process.exit(1);
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err, coffee.toString());
    process.exit(1);
  });
