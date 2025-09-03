const { Router } = require("express");
const productController = require("../controllers/productController");
const {
  allowedProducts,
  attachProductTypeById,
  getProductModel,
  checkQueryString,
} = require("../middlewares/productMiddlewares");
const router = Router();
const { allowTo } = require("../middlewares/policies");
const auth = require("../middlewares/authMiddleware");
const rateController = require("../controllers/ratingController");

router.get(
  "/",
  auth(true),
  checkQueryString,
  allowedProducts("Coffee", "Accessory", "Machine", "Tea"),
  getProductModel,
  productController.findAll
);
router.post(
  "/",
  auth(),
  allowTo("baristica", "admin", "superadmin"),
  allowedProducts("Coffee", "Accessory", "Machine", "Tea"),
  getProductModel,
  productController.createProduct
);

router.get("/processing-methods", productController.getProcessingMethods);
router.use("/:id", attachProductTypeById, getProductModel);
router.get("/:id", auth(true), productController.findById);

router.use(auth());
router.post("/:id/rate", rateController.rate);
router.all("/:id/favorite", (req, res, next) => res.redirect("/api/v1/favorites"));

router.use(allowTo("baristica", "admin", "superadmin"));
router.patch("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
