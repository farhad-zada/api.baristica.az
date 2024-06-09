const router = require("express").Router();

const {
  login,
  register,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const {
  validateNewUserMiddleware,
} = require("../middlewares/validateNewUserMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/login", login);
router.post("/register", validateNewUserMiddleware, register);
router.post("/logout", authMiddleware, logout);
router.patch("/update-password", authMiddleware, updatePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
