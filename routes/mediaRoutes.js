const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const mediaMiddleware = require("../middlewares/mediaMiddleware")
const { allowTo } = require("../middlewares/policies");
const { listImages, storeMedia, storeMediaAsPrivileged, deleteMediaAsPrivileged } = require("../controllers/mediaController")

router.use(auth(false))

router.get("/", allowTo("admin", "baristica"), listImages);
router.post(
  "/",
  mediaMiddleware,
  storeMedia
);

router.use("/gallery", allowTo('baristica', 'admin'));

router.post(
  "/gallery",
  mediaMiddleware,
  storeMediaAsPrivileged
);

router.delete(
  "/gallery/:imageName",
  deleteMediaAsPrivileged
);


module.exports = router;