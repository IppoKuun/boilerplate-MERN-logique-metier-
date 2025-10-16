// routes/vehicles.routes.js
// But : exposer un CRUD basique pour Vehicle, 100% backoffice (protégé par auth).
// Traduction “humaine” : on protège toutes les routes, on valide/sanitize l’entrée,
// puis on délègue au contrôleur. Simple et lisible.

import { Router } from "express";
import requireAuth from "../middlewares/requireAuth.js";
import validate from "../middlewares/validate.js";
import * as ctrl from "../controllers/vehicles.controller.js";

// Schémas Joi séparés (lisibilité + réutilisation)
import {
  listVehicles,      // validation de req.query pour la liste
  createVehicle,     // validation de req.body pour POST
  updateVehicle,     // validation de req.body pour PATCH
  idParam,           // validation de req.params (/:id)
} from "../validators/vehicles.validator.js";

const router = Router();

// Toutes les routes sont privées (backoffice uniquement)
router.use(requireAuth());

// LISTE : GET /api/vehicles?make=...&price[min]=...
router.get(
  "/",
  validate({ query: listVehicles }), // on nettoie/valide les filtres + pagination/tri
  ctrl.list
);

// READ : GET /api/vehicles/:id
router.get(
  "/:id",
  validate({ params: idParam }), // on vérifie que l'id est bien un ObjectId hex de 24 chars
  ctrl.read
);

// CREATE : POST /api/vehicles
router.post(
  "/",
  validate({ body: createVehicle }), // on exige les champs requis (make, model, year, price, ...)
  ctrl.create
);

// UPDATE : PATCH /api/vehicles/:id
router.patch(
  "/:id",
  validate({ params: idParam, body: updateVehicle }), // body partiel autorisé, patch safe côté contrôleur
  ctrl.update
);

// DELETE : DELETE /api/vehicles/:id
router.delete(
  "/:id",
  validate({ params: idParam }),
  ctrl.remove
);

export default router;

/*
Brancher dans server.js :
  import vehiclesRoutes from "./routes/vehicles.routes.js";
  app.use("/api/vehicles", vehiclesRoutes);

Rappel :
- La sécurité “utile” est déjà couverte : requireAuth + validate/sanitize + contrôleur avec buildSafePatch.
- Les schémas (validators/vehicles.validator.js) définissent ce qui est accepté pour chaque endpoint.
*/


// validators/vehicles.validator.js
// But : schémas Joi pour Vehicle (list/create/update/id).
// On importe Joi depuis ton middleware pour garder les mêmes options par défaut.
import { Joi } from "../middlewares/validate.js";

// Petites listes fermées (anti fautes + tri propre côté backoffice)
export const VEHICLE_STATUS = ["draft", "available", "sold"];
export const FUEL_TYPES = ["essence", "diesel", "hybrid", "electric"];
export const TRANSMISSIONS = ["manual", "auto"];
export const SORTABLE_FIELDS = ["createdAt", "price", "year", "mileage"];

// Utiles pour les plages min/max
const currentYear = new Date().getFullYear();
const posInt = Joi.number().integer().min(1);

// Schéma “plage” générique : { min?, max? } avec min <= max si les deux sont là
const range = Joi.object({
  min: Joi.number(),
  max: Joi.number(),
}).custom((v, helpers) => {
  if (typeof v.min === "number" && typeof v.max === "number" && v.min > v.max) {
    return helpers.error("any.invalid");
  }
  return v;
}, "min/max sanity");

// 1) LISTE — filtre + tri + pagination (backoffice)
export const listVehicles = Joi.object({
  // égalités simples (filtrage)
  make: Joi.string().trim(),
  model: Joi.string().trim(),
  status: Joi.string().valid(...VEHICLE_STATUS),
  fuel: Joi.string().valid(...FUEL_TYPES),
  transmission: Joi.string().valid(...TRANSMISSIONS),
  color: Joi.string().trim(),

  // plages min/max (2 syntaxes supportées : objet OU bracket keys)
  price: range,
  year: range,
  mileage: range,
  "price[min]": Joi.number().min(0),
  "price[max]": Joi.number().min(0),
  "year[min]": Joi.number().min(1900),
  "year[max]": Joi.number().max(currentYear + 1),
  "mileage[min]": Joi.number().min(0),
  "mileage[max]": Joi.number().min(0),

  // recherche texte simple (ex: q=BMW)
  q: Joi.string().trim().max(60),

  // tri whiteliste + ordre
  sortBy: Joi.string().valid(...SORTABLE_FIELDS).default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),

  // pagination bornée
  page: posInt.default(1),
  limit: posInt.max(100).default(20),
});

// 2) CREATE — champs requis minimaux pour ajouter une voiture
export const createVehicle = Joi.object({
  vin: Joi.string().trim().max(64),
  plate: Joi.string().trim().uppercase().max(32),

  make: Joi.string().trim().required(),
  model: Joi.string().trim().required(),
  trim: Joi.string().trim().allow(""),

  year: Joi.number().integer().min(1900).max(currentYear + 1).required(),
  mileage: Joi.number().integer().min(0).default(0),
  color: Joi.string().trim().allow(""),

  fuel: Joi.string().valid(...FUEL_TYPES),
  transmission: Joi.string().valid(...TRANSMISSIONS),

  price: Joi.number().min(0).required(),
  currency: Joi.string().trim().uppercase().length(3).default("EUR"),
  status: Joi.string().valid(...VEHICLE_STATUS).default("draft"),

  description: Joi.string().trim().max(5000).allow(""),
  images: Joi.array().items(Joi.string().trim()).default([]),
  options: Joi.array().items(Joi.string().trim()).default([]),
});

// 3) UPDATE — tout optionnel (PATCH partiel), SANS defaults (pour ne pas forcer de champs)
export const updateVehicle = Joi.object({
  vin: Joi.string().trim().max(64),
  plate: Joi.string().trim().uppercase().max(32),

  make: Joi.string().trim(),
  model: Joi.string().trim(),
  trim: Joi.string().trim(),

  year: Joi.number().integer().min(1900).max(currentYear + 1),
  mileage: Joi.number().integer().min(0),
  color: Joi.string().trim(),

  fuel: Joi.string().valid(...FUEL_TYPES),
  transmission: Joi.string().valid(...TRANSMISSIONS),

  price: Joi.number().min(0),
  currency: Joi.string().trim().uppercase().length(3),
  status: Joi.string().valid(...VEHICLE_STATUS),

  description: Joi.string().trim().max(5000),
  images: Joi.array().items(Joi.string().trim()),
  options: Joi.array().items(Joi.string().trim()),
}).min(1); // Traduction : il faut au moins 1 champ à mettre à jour

// 4) PARAM : vérifie un id Mongo
export const idParam = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
