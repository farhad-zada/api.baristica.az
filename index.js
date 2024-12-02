const express = require("express");
const mongoose = require("mongoose");
const { ServerApiVersion } = require("mongodb");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const config = require("./config");
const logger = require("./utils/logger");
const bot = require("./telegram");
const path = require("path");
config.validateConfig(config);
const uri = config.db_uri();
require("dotenv").config();

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

    app.use(cookieParser());
    app.use(
      cors({
        origin: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true
      })
    );
    app.use(
      helmet({
        contentSecurityPolicy: false, // Disable CSP if it's conflicting
      })
    );
    
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(mongoSanitize());
    app.use((req, res, next) => {
      logger.info(`${req.ip} ${req.method} ${req.url}`);
      next();
    });

    // Serve static files in /md from the images directory
    const imagesPath = path.join(__dirname, "public/images");

    app.use(
      "/md",
      (req, res, next) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // Allow cross-origin access
        next();
      },
      express.static(imagesPath)
    );

    app.use("/api/v1", require("./routes/api"));

    app.use("*", (req, res) =>
      res
        .status(404)
        .json({ status: false, message: "You hit a wrong route! 🤫" })
    );

    const server = app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      bot.launch();
    });
  })

  .catch((err) => {
    console.error("Failed to connect to the database", err);
    process.exit(1);
  });
