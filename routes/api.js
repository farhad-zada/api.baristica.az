const { Router } = require("express");

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API",
  });
});

router.get("delivery/fee", (req, res) => {
  res.json({
    fee: 500,
  });
});

router.use("/media", require("./mediaRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/comments", require("./commentRoutes"));
router.use("/favorites", require("./favoriteRoutes"));
router.use("/cart", require("./cartRoutes"));

module.exports = router;
