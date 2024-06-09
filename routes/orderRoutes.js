const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const { validateOrder } = require("../middlewares/validateOrderMiddleware");

const {
  index,
  orderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const { allowTo } = require("../middlewares/policies");

router.get("/", index);
router.get("/:orderId", orderById);
router.post("/", auth, validateOrder, createOrder); // product ids, product quantities,

router.use(auth, allowTo("baristica", "admin", "superadmin"));

router.patch("/:orderId", updateOrder);
router.delete("/:orderId", deleteOrder);

module.exports = router;
