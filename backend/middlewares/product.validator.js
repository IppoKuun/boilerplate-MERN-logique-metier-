import Joi from "joi";

const allowedCat = [
  "electronics", "fashion", "home", "beauty", "sports",
  "toys", "automotive", "books", "groceries", "health",
  "office", "garden", "music", "video_games"
];

export const PRODUCT_SORTABLE_FIELDS = ["price", "createdAt", "updatedAt", "nom"];

const posInt = Joi.number().integer().min(1);

const ranges = Joi.object({
  min: Joi.number(),
  max: Joi.number()
}).custom((v, h) => {
  if (v?.min !== undefined && v?.max !== undefined && Number(v.min) > Number(v.max)) {
    return h.error("any.invalid");
  }
  return v;
});

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; // À ajouter si pas défini ailleurs

const productQuery = Joi.object({
  nom: Joi.string().required().trim(), // CORRIGÉ ICI
  slug: Joi.string().required().trim().pattern(slugRegex),
  price: ranges,
  q: Joi.string().max(220).trim(),
  category: Joi.string().required().valid(...allowedCat),
  sortBy: Joi.string().valid(...PRODUCT_SORTABLE_FIELDS).default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
  page: posInt.default(1),
  limit: posInt.max(100).default(20),
}).unknown(false);

const money = Joi.number().positive().precision(2); // À définir

const CATEGORY_LIST = allowedCat; // À vérifier que c'est bien défini

const productBase = Joi.object({
  nom: Joi.string().trim().lowercase().min(1).max(120),
  description: Joi.string().trim().max(5000),
  shortDesc: Joi.string().trim().max(280),
  slug: Joi.string().trim().lowercase().pattern(slugRegex),
  price: money,
  category: Joi.array().items(Joi.string().valid(...CATEGORY_LIST)).min(1).unique(),
  isActive: Joi.boolean(),
  images: Joi.array().items(Joi.string().uri()),
});

export const updateProductBody = productBase.min(1).unknown(false);

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