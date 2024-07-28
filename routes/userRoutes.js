const router = require("express").Router();

const {
  me,
  updateMe,
  addAddress,
  removeAddress,
} = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware");

router.get("/me", authMiddleware(), me);
router.patch("/me", authMiddleware(), updateMe);
router.post("/me/address", authMiddleware(), addAddress);
router.delete("/me/address/:addressId", authMiddleware(), removeAddress);

module.exports = router;
