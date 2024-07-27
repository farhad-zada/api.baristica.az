const router = require("express").Router();

const { me, updateMe } = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware");

router.get("/me", authMiddleware(), me);
router.patch("/me", authMiddleware(), updateMe);

module.exports = router;
