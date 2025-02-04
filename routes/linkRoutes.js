const router = require("express").Router();

const {
  createLink,
  deleteLink,
  getLinks,
} = require("../controllers/linkController");
const { restrictTo, allowTo } = require("../middlewares/policies");
const auth = require("../middlewares/authMiddleware");

router.get("/:productId", getLinks);

router.use(auth(true), allowTo("admin", "superadmin"));
router.post("/", createLink);
router.delete("/:linkId", deleteLink);

module.exports = router;
