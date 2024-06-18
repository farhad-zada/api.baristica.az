const express = require("express");
const mongoose = require("mongoose");
const { ServerApiVersion } = require("mongodb");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const config = require("./config");
const bot = require("./telegram");
config.validateConfig(config);
const uri = config.db_uri();

mongoose
  .connect(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  })
  .then(() => {
    console.log("Successfully connected to the database");

    app.use(cors());
    app.use(helmet());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(mongoSanitize());
    app.use("/api/v1", require("./routes/api"));

    app.use("*", (req, res) =>
      res
        .status(404)
        .json({ status: false, message: "You hit a wrong route! 🤫" })
    );

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      bot.launch();
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
    process.exit(1); // Exit the process with a failure code
  });
