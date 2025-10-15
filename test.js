// utils/queryBuilder.js
// Objectif : transformer des query params en { filter, sort, sortBy, order } SÉCURISÉS.
// Pensé pour Vehicle, mais assez générique.
// Traduction humaine : on ne garde que les filtres autorisés, on gère les plages min/max,
// et on whiteliste le tri pour éviter les surprises.

const DEFAULT_ALLOWED_SORT = new Set(["createdAt", "price", "year", "mileage"]);
const DEFAULT_EQUALS = new Set(["make", "model", "status", "fuel", "transmission", "color"]);
const DEFAULT_RANGES = new Set(["price", "year", "mileage"]);

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined; // Traduction : si pas un nombre, on ignore.
};

function readRange(query, field) {
  // Supporte price[min]=... / price[max]=...
  // ET fallback si le parseur n’est pas “nested”: query["price[min]"], query["price[max]"].
  const obj = query?.[field];
  const min =
    (obj && toNum(obj.min)) ??
    toNum(query?.[`${field}[min]`]) ??
    toNum(query?.[`${field}.min`]);
  const max =
    (obj && toNum(obj.max)) ??
    toNum(query?.[`${field}[max]`]) ??
    toNum(query?.[`${field}.max`]);

  const out = {};
  if (typeof min === "number") out.$gte = min;
  if (typeof max === "number") out.$lte = max;
  return Object.keys(out).length ? out : undefined; // Traduction : si rien, on ne met pas de filtre.
}

export function buildQuery(
  query = {},
  {
    equals = DEFAULT_EQUALS,       // champs filtrables en égalité stricte
    ranges = DEFAULT_RANGES,       // champs avec min/max
    allowedSort = DEFAULT_ALLOWED_SORT, // champs autorisés pour le tri
  } = {}
) {
  const filter = {};

  // 1) Filtres "égalité" (ex: make=BMW)
  for (const f of equals) {
    if (query[f] != null && query[f] !== "") filter[f] = query[f];
  }

  // 2) Filtres "plage" min/max (ex: price[min]=10000)
  for (const f of ranges) {
    const range = readRange(query, f);
    if (range) filter[f] = range;
  }


  // 4) Tri (whitelist) + ordre
  const sortBy = allowedSort.has(String(query.sortBy)) ? String(query.sortBy) : "createdAt";
  const order = String(query.order || "desc").toLowerCase() === "asc" ? 1 : -1;
  const sort = { [sortBy]: order };

  return { filter, sort, sortBy, order };
}

// utils/pagination.js
// Objectif : calculer { page, limit, skip } depuis req.query et fabriquer un meta standard.
// Traduction humaine : on borne la taille, on calcule l’offset, et on renvoie un petit résumé.

const toPosInt = (v, fallback) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

export function getPagination(query = {},{ defaultLimit = 20, maxLimit = 100, defaultPage = 1 } = {}) 

  {
  const page = toPosInt(query.page, defaultPage);
  const rawLimit = toPosInt(query.limit, defaultLimit);
  const limit = Math.min(maxLimit, rawLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// Petit helper pour retourner un “meta” uniforme dans la réponse de liste
export function buildMeta({ total, page, limit, sortBy, order }) {
  const pages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));
  const hasNext = page < pages;
  const hasPrev = page > 1;
  return { page, limit, total, pages, hasNext, hasPrev, sortBy, order };
} 

export default { getPagination, buildMeta };