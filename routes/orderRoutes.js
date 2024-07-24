const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const { validateOrder } = require("../middlewares/validateOrderMiddleware");

const {
  index,
  orderById,
  createOrder,
  updateOrder,
  deleteOrder,
  orderCheck,
} = require("../controllers/orderController");
const { allowTo } = require("../middlewares/policies");
const logger = require("../utils/logger");

router.get("/", index);
router.post("/check", orderCheck);
router.get("/:orderId", orderById); // TODO: implement orderById
router.post("/", auth, validateOrder, createOrder); // product ids, product quantities,

router.use(auth, allowTo("baristica", "admin", "superadmin"));

router.patch("/:orderId", updateOrder);
router.delete("/:orderId", deleteOrder);

module.exports = router;
