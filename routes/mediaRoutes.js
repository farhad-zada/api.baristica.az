const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const { allowTo } = require("../middlewares/policies");
const { listImages, storeMedia } = require("../controllers/mediaController")

router.use(auth(false))

router.get("/", allowTo("admin", "baristica"), listImages);
router.post(
  "/",
  require("../middlewares/mediaMiddleware"),
  storeMedia
);

module.exports = router;