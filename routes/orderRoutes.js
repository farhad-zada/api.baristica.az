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
  deleteOrder,
  orderCheck,
} = require("../controllers/orderController");
const { allowTo } = require("../middlewares/policies");

router.post("/check", checkSignature, confirmStatus, orderCheck);

router.use(auth()); // all authenticated

router.get("/", index);
router.get("/:orderId", orderById);
router.post("/", validateOrder, createOrder); // product ids, product quantities,

router.use(allowTo("baristica", "admin", "superadmin")); // admin routes

// router.delete("/:orderId", deleteOrder);

module.exports = router;
