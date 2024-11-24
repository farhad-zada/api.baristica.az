const router = require("express").Router();

const {
  me,
  updateMe,
  addAddress,
  updateAddress,
  removeAddress,
} = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware");

router.get("/me", authMiddleware(), me);
router.patch("/me", authMiddleware(), updateMe);
router.post("/me/address", authMiddleware(), addAddress);
router.patch("/me/address/:id", authMiddleware(), updateAddress);
router.delete("/me/address/:addressId", authMiddleware(), removeAddress);
router.get("/comments", (req, res, next) => res.redirect("/api/v1/comments/"));
router.get("/orders", (req, res, next) => res.redirect("/api/v1/orders"));

module.exports = router;
