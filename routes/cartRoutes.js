const { Router } = require("express");
const {
  index,
  findByProductId,
  addToCart,
  requantify,
  removeFromCart,
} = require("../controllers/cartController");

const router = Router();
const auth = require("../middlewares/authMiddleware");

router.use(auth());

router.get("/", index);
router.get("/:id", findByProductId);
router.post("/", addToCart);
router.patch("/:id", requantify);
router.delete("/:id", removeFromCart);

module.exports = router;
