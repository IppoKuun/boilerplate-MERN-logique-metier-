// back/middlewares/product.validator.js
import Joi from "joi";

export const allowedCat = [
  "electronics","fashion","home","beauty","sports",
  "toys","automotive","books","groceries","health",
  "office","garden","music","video_games", "clothes"
];

export const PRODUCT_SORTABLE_FIELDS = ["price","createdAt","updatedAt","name"];

const posInt = Joi.number().integer().min(1);

const ranges = Joi.object({
  min: Joi.number(),
  max: Joi.number()
}).custom((v, h) => {
  if (v?.min != null && v?.max != null && v.min > v.max) {
    return h.error("any.invalid", { message: "min cannot be greater than max" });
  }
  return v;
});

// ✅ Schéma de QUERY pour GET /products (tous optionnels)
export const productQuery = Joi.object({
  page: posInt.default(1),
  limit: posInt.max(100).default(20),
  q: Joi.string().allow("").optional(),
  sortBy: Joi.string().valid(...PRODUCT_SORTABLE_FIELDS).default("createdAt"),
  order: Joi.string().valid("asc","desc").default("desc"),
  price: ranges.optional(),
  category: Joi.alternatives().try(
    Joi.string().valid(...allowedCat),
    Joi.array().items(Joi.string().valid(...allowedCat))
  ).optional(),
  isActive: Joi.boolean().optional(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
}).unknown(false);

// ✅ Schéma de BODY pour POST/PUT/PATCH (champs « métier »)
export const productBase = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow("").default(""),
  price: Joi.number().min(0).required(),
  category: Joi.string().valid(...allowedCat).required(),
  slug: Joi.string().min(1),
  shortDesc: Joi.string().allow("").default(""),
  images: Joi.array().items(Joi.object().unknown(true)),

  isActive: Joi.boolean().default(true),
}).unknown(false);




export const updateProductBody = productBase
  .fork(['name','price','category'], (s) => s.optional())
  .min(1)
  .unknown(false);


// :id params
export const idParam = Joi.object({
  id: Joi.string().length(24).hex().required(),
}).unknown(false);

export default {
  productQuery,
  allowedCat,
  productBase,
  PRODUCT_SORTABLE_FIELDS,
  updateProductBody,
  idParam,
};
