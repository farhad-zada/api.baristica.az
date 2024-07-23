const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const {
  checkIfProductExists,
  checkIfFavoriteExists,
} = require("../middlewares/favoritesMiddleware");
const {
  addFavorite,
  removeFavorite,
} = require("../controllers/favoritesController");

router.post(
  "/:productId",
  auth,
  checkIfProductExists,
  checkIfFavoriteExists,
  addFavorite
);
router.delete(
  "/:productId",
  auth,
  checkIfProductExists,
  checkIfFavoriteExists,
  removeFavorite
);

module.exports = router;
