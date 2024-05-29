const { Router } = require("express");

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API",
  });
});

router.use("/products", require("./productRoutes"));
router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));

module.exports = router;
