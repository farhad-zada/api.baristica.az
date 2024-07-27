const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const { validateOrder } = require("../middlewares/validateOrderMiddleware");
const {
  confirmStatus,
  checkSignature,
} = require("../middlewares/resultRequestMiddleware");

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

router.get("/", auth(), index);
router.post("/check", checkSignature, confirmStatus, orderCheck);
router.get("/:orderId", auth(), orderById);
router.post("/", auth(), validateOrder, createOrder); // product ids, product quantities,

router.use(auth(), allowTo("baristica", "admin", "superadmin"));

router.patch("/:orderId", updateOrder);
router.delete("/:orderId", deleteOrder);

module.exports = router;
