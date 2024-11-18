const router = require("express").Router();

module.exports = router.post(
  "/",
  require("../middlewares/mediaMiddleware"),
  require("../controllers/mediaController")
);
