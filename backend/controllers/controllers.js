// controllers/vehicles.controller.js
// But : lister les véhicules avec filtres, tri whitelisté et pagination standardisée.

import Vehicle from "../models/Vehicle.js";
import { buildQuery } from "../utils/queryBuilder.js";
import { getPagination, buildMeta } from "../utils/pagination.js";

const MAX_LIMIT = 100; // garde-fou serveur : personne ne peut demander > 100 items/page

export async function list(req, res) {
  // (1) Pagination bornee depuis req.query
  // "Humain" : calcule page/limit/skip proprement (valeurs par défaut, mini/maxi, offset)
  const { page, limit, skip } = getPagination(req.query, {
    defaultLimit: 20,
    maxLimit: MAX_LIMIT,
    defaultPage: 1,
  });

  // (2) Filtres + tri sécurisés depuis req.query
  // "Humain" : on ne garde que les champs autorisés et on force un tri whitelisté
  const { filter, sort, sortBy, order } = buildQuery(req.query, {
    equals: new Set(["make", "model", "status", "fuel", "transmission", "color"]),
    ranges: new Set(["price", "year", "mileage"]),
    allowedSort: new Set(["createdAt", "price", "year", "mileage"]),
  });

  // (3) Lecture DB en parallèle (liste + total)
  // "Humain" : va chercher la page demandée et, en même temps, compte le total pour la pagination
  const [items, total] = await Promise.all([
    Vehicle.find(filter).sort(sort).skip(skip).limit(limit).lean(), // objets JS simples = plus rapide
    Vehicle.countDocuments(filter),
  ]);

  // (4) Meta uniforme pour le front (pages, hasNext, etc.)
  // "Humain" : calcule un résumé standard pour la pagination côté UI
  const meta = buildMeta({ total, page, limit, sortBy, order });

  // (5) Réponse propre et stable
  // "Humain" : le front reçoit la liste + toutes les infos de pagination/tri dans meta
  return res.json({ items, meta });
}
