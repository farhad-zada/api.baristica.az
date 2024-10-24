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

module.exports = router;
