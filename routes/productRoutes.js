const { Router } = require("express");
const productControllers = require("../controllers/productControllers");
const { validateNewProduct } = require("../middlewares/productMiddlewares");
const router = Router();

router.get("/", productControllers.allProducts);
router.get("/:id", productControllers.productById);
router.post("/", validateNewProduct, productControllers.createProduct);
router.patch("/:id", productControllers.updateProduct);
router.delete("/:id", productControllers.deleteProduct);

module.exports = router;
