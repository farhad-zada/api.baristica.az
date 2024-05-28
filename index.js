const express = require("express");
const mongoose = require("mongoose");
const { ServerApiVersion } = require("mongodb");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const app = express();
const config = require("./config");
config.validateConfig(config);

const uri = config.db_uri();

mongoose.connect(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(express.json());
app.use(helmet());
app.use(mongoSanitize());
app.use("/api/v1", require("./routes/api"));

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
