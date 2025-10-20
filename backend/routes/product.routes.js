import {Router} from "express"
import requireAuth from "../middlewares/requireAuth";
import * as productControllers from "../controllers/productControllers"
import validate from "../middlewares/validate";
import productValidator from "../middlewares/product.validator";

const { productQuery, productBase, updateVehicleBody, idParam } = productValidator

const userRouter = Router()

userRouter.get("/", validate({query : productQuery}), productControllers.list)

userRouter.get("/:id", validate({params : idParam}), productControllers.getProduct)

userRouter.get("/slug/:slug", productControllers.getProductBySlug);

userRouter.post("/", validate({body: productBase}), requireAuth(["owner", "admin"]),  productControllers.postProduct)

userRouter.patch("/:id", validate({ body: updateVehicleBody }) ,requireAuth(["owner", "admin"]) ,productControllers.updateProduct )

userRouter.delete("/:id", validate({params: idParam }), requireAuth(["owner", "admin"]),  productControllers.deleteProduct)

module.exports = userRouter