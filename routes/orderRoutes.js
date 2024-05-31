const router = require("express").Router();

const {
  index,
  orderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderControllers");

router.get("/", index);
router.get("/:orderId", orderById);
router.post("/", createOrder);
router.patch("/:orderId", updateOrder);
router.delete("/:orderId", deleteOrder);

module.exports = router;
