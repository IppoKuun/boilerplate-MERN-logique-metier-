import {Router} from "express"
import requireAuth from "../middlewares/requireAuth.js";
import productControllers from "../controllers/productControllers.js"
import validate from "../middlewares/validate.js";
import productValidator from "../middlewares/product.validator.js";
import { allowedCat } from "../middlewares/product.validator.js";
import { checkOrigin } from "../middlewares/CSRF.js";

const { productQuery, productBase, updateProductBody, idParam } = productValidator

export const productRouter = Router()


productRouter.get("/categories", (req, res) => {
  res.json({ categories: allowedCat });
});

productRouter.get("/:id", validate({ params: idParam }), productControllers.getProduct);

productRouter.get("/", validate({query : productQuery}), productControllers.list)

productRouter.get("/slug/:slug", productControllers.getProductBySlug);

productRouter.post(
  "/",
  checkOrigin,
  validate({
    body: productBase,
  }, {
    allowedPaths: ["name","description","shortDesc","price","category","slug","images","isActive"]
  }),
  requireAuth(["owner","admin"]),
  productControllers.postProduct
);


productRouter.patch("/:id", validate(
    { body: updateProductBody },
    { allowedPaths: ["name","description","shortDesc","price","category","slug","images","isActive"] }
  ) , checkOrigin, requireAuth(["owner", "admin"]) ,productControllers.updateProduct )

productRouter.delete("/:id", validate({params: idParam }), checkOrigin, requireAuth(["owner", "admin"]),  productControllers.deleteProduct)
