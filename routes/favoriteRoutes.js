const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const {
  checkIfProductExists,
  checkIfFavoriteExists,
} = require("../middlewares/favoritesMiddleware");
const {
  allFavorites,
  isFavorite,
  addFavorite,
  removeFavorite,
} = require("../controllers/favoritesController");

router.use(auth());
router.get("/", allFavorites);
router.get("/:productId", isFavorite);
router.use("/:productId", checkIfProductExists, checkIfFavoriteExists);
router.post("/:productId", addFavorite);
router.delete("/:productId", removeFavorite);

module.exports = router;
