const { Router } = require("express");
const productController = require("../controllers/productController");
const {
  allowedProducts,
  attachProductTypeById,
  getProductModel,
  checkQueryString,
  attachProduct,
} = require("../middlewares/productMiddlewares");
const router = Router();
const { restrictTo, allowTo } = require("../middlewares/policies");
const auth = require("../middlewares/authMiddleware");
const rateController = require("../controllers/ratingController");

router.get(
  "/",
  auth(true),
  checkQueryString,
  getProductModel,
  productController.findAll
);
router.post(
  "/",
  auth(),
  allowTo("baristica", "admin", "superadmin"),
  allowedProducts("coffee", "accessory", "machine"),
  getProductModel,
  productController.createProduct
);

router.post(
  "/link/:id",
  auth(),
  allowTo("baristica", "admin", "superadmin"),
  attachProductTypeById,
  getProductModel,
  productController.linkProducts
);

router.delete(
  "/link/:id",
  auth(),
  allowTo("baristica", "admin", "superadmin"),
  attachProductTypeById,
  getProductModel,
  attachProduct,
  productController.removeLink
);

router.use("/:id", attachProductTypeById, getProductModel);
router.get("/:id", auth(true), productController.findById);

router.use(auth());
router.post("/:id/rate", rateController.rate);
router.all("/:id/favorite", (req, res, next) => res.redirect("/api/v1/favorites"));

router.use(allowTo("baristica", "admin", "superadmin"));
router.patch("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
