import {Router} from "express"
import requireAuth from "../middlewares/requireAuth";
import * as productControllers from "../controllers/productControllers"
import validate from "../middlewares/validate";
import productValidator from "../middlewares/product.validator";

const { productQuery, productBase, updateVehicleBody, idParam } = productValidator

const router = Router()

router.get("/", validate({query : productQuery}), productControllers.list)

router.get("/:id", validate({params : idParam}), productControllers.getProduct)

router.post("/", validate({body: productBase}), requireAuth(["owner", "admin"]),  productControllers.postProduct)

router.patch("/:id", validate({ body: updateVehicleBody }) ,requireAuth(["owner", "admin"]) ,productControllers.updateProduct )

router.delete("/:id", validate({params: idParam }), requireAuth(["owner", "admin"]),  productControllers.deleteProduct)

