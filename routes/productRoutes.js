const { Router } = require("express");
const productControllers = require("../controllers/productController");
const { validateNewProduct } = require("../middlewares/productMiddlewares");
const router = Router();
const { restrictTo, allowTo } = require("../middlewares/policies");
const auth = require("../middlewares/authMiddleware");
const { checkQueryString } = require("../middlewares/checkQueryString");

router.get("/", checkQueryString, productControllers.allProducts);
router.get("/:id", productControllers.productById);

router.use(auth, allowTo("baristica", "admin", "superadmin"));

router.post("/", validateNewProduct, productControllers.createProduct);
router.patch("/:id", productControllers.updateProduct);
router.delete("/:id", productControllers.deleteProduct);

module.exports = router;
