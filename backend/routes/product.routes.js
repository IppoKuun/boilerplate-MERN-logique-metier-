import {Router} from "express"
import requireAuth from "../middlewares/requireAuth.js";
import productControllers from "../controllers/productControllers.js"
import validate from "../middlewares/validate.js";
import productValidator from "../middlewares/product.validator.js";

const { productQuery, productBase, updateProductBody, idParam } = productValidator

export const productRouter = Router()

productRouter.get("/", validate({query : productQuery}), productControllers.list)

productRouter.get("/:id", validate({params : idParam}), productControllers.getProduct)

productRouter.get("/slug/:slug", productControllers.getProductBySlug);

productRouter.post("/", validate({body: productBase}), requireAuth(["owner", "admin"]),  productControllers.postProduct)

productRouter.patch("/:id", validate({ body: updateProductBody }) ,requireAuth(["owner", "admin"]) ,productControllers.updateProduct )

productRouter.delete("/:id", validate({params: idParam }), requireAuth(["owner", "admin"]),  productControllers.deleteProduct)
