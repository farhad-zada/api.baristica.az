function validateConfig(config) {
  if (!config.port) {
    throw new Error("\x1b[31mPort is not defined in config.js\x1b[0m");
  }
  if (!config.environment) {
    throw new Error("\x1b[31mEnvironment is not defined in config.js\x1b[0m");
  }
  if (!config.db_name) {
    throw new Error("\x1b[31mDatabase name is not defined in config.js\x1b[0m");
  }
  if (!config.db_user) {
    throw new Error("\x1b[31mDatabase user is not defined in config.js\x1b[0m");
  }
  if (!config.db_pass) {
    throw new Error(
      "\x1b[31mDatabase password is not defined in config.js\x1b[0m"
    );
  }
  if (!config.db_uri()) {
    throw new Error("\x1b[31mDatabase URI is not defined in config.js\x1b[0m");
  } else {
    console.log("\x1b[32m[nous] config validated successfully!\x1b[0m");
  }
}

module.exports = {
  port: 80,
  environment: "development",
  db_name: "example_db",
  db_user: "example_user",
  db_pass: "example_pass",
  db_app_name: "example",
  db_uri: function () {
    return (
      "mongodb+srv://" +
      this.db_user +
      ":" +
      this.db_pass +
      "@example.8qecers.mongodb.net/" +
      this.db_name +
      "?retryWrites=true&w=majority&appName=" +
      this.db_app_name
    );
  },
  validateConfig,
  secret: "jwt secret",
  token_expiration: "10m", // 10 minutes
  cookie_http_only: true,
  email_service: "Gmail",
  email_username: "example",
  email_password: "examplePassword",
  delivery_fee: 500,
  allowedOrigins: "*",
  epointPrivateKey: "examplePrivateKey",
  epointPublicKey: "examplePublicKey",
  epointRequestUrl: "https://example.com/api/1/request",
  epointCheckoutUrl: "https://example.com/api/1/checkout",
  epointGetStatusUrl: "https://example.com/api/1/get-status",
};
/*
 validateConfig,
  secret: "i_door_melting_your_tree",
  token_expiration: "90d", // 3 months
  cookie_http_only: true,
  email_service: "Gmail",
  email_username: "farhad.szd@gmail.com",
  email_password: "wiqq efxm qbgx wfpm",
  delivery_fee: 500,
  allowedOrigins: "*",
  epointPrivateKey: "2v5v7HCg4YjkITZn40gnYAJI",
  epointPublicKey: "i000200227",
  epointRequestUrl: "https://epoint.az/api/1/request",
  epointCheckoutUrl: "https://epoint.az/api/1/checkout",
  epointGetStatusUrl: "https://epoint.az/api/1/get-status",*/
