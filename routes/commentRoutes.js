const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const checkQueryString = require("../middlewares/checkQueryString");

const {
  all,
  create,
  update,
  remove,
} = require("../controllers/commentController");

router.use(auth());
router.get("/", auth(), checkQueryString, all);
router.get("/:productId", checkQueryString, all);
router.post("/", auth(), create);
router.patch("/:id", auth(), update);
router.delete("/:id", auth(), remove);

module.exports = router;
