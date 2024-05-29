const router = require("express").Router();

const {
  login,
  register,
  logout,
  updatePassword,
  forgotPassword,
} = require("../controllers/authControllers");
const {
  validateNewUserMiddleware,
} = require("../middlewares/validateNewUserMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/login", login);
router.post("/register", validateNewUserMiddleware, register);
router.post("/logout", authMiddleware, logout);
router.patch("/update-password", authMiddleware, updatePassword);
router.post("/forgot-password", forgotPassword);

module.exports = router;
