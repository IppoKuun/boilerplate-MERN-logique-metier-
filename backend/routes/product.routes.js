import {Router} from "express"
import requireAuth from "../middlewares/requireAuth";
import * as productControllers from "../controllers/productControllers"
import validate from "../middlewares/validate";
import productValidator from "../middlewares/product.validator";

const { productQuery, productBase, updateVehicleBody, idParam } = productValidator

const productRouter = Router()

productRouter.get("/", validate({query : productQuery}), productControllers.list)

productRouter.get("/:id", validate({params : idParam}), productControllers.getProduct)

productRouter.get("/slug/:slug", productControllers.getProductBySlug);

productRouter.post("/", validate({body: productBase}), requireAuth(["owner", "admin"]),  productControllers.postProduct)

productRouter.patch("/:id", validate({ body: updateVehicleBody }) ,requireAuth(["owner", "admin"]) ,productControllers.updateProduct )

productRouter.delete("/:id", validate({params: idParam }), requireAuth(["owner", "admin"]),  productControllers.deleteProduct)

module.exports = productRouter