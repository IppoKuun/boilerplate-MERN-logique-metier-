
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined; 
};

// A REMPLIR SELON LES CHAMPS DU SCHEMA !!!!
const DEFAULT_ALLOWED_SORT = new Set (["price", "createdAt", "updatedAt", 
  "ts", "actor.user", "target.slug", "event"])
const DEFAULT_EQUALS = new Set (["category", "slug", "name", "event", 
  "target.slug", "target.id", "actor.user", "actor.role", "actor.id", "CorrelationId"])
const DEFAULT_RANGES = new Set (["price", "createdAt", "updatedAt", "ts", "diff.size"])

function setRanges(query, champ){
    const obj = query?.[champ]
    const min = (obj && toNum(obj.min)) ??
    toNum(query?.[`${champ}[min]`]) ??
    toNum(query?.[`${champ}.min`]);
      const max =
    (obj && toNum(obj.max)) ??
    toNum(query?.[`${champ}[max]`]) ??
    toNum(query?.[`${champ}.max`]);

  const out = {};
  if (min !== undefined) out.$gte = min;
  if (max !== undefined) out.$lte = max;
    return Object.keys(out).length ? out: undefined
}


export function queryBuilder(query = {}, {
  allowedSort = DEFAULT_ALLOWED_SORT,
  equals = DEFAULT_EQUALS,
  ranges = DEFAULT_RANGES,
} = {}) {
  const filter = {};
  for (const field of equals) {
    const value = query[field];
    if (value !== undefined && value !== "") filter[field] = value;
  }
  for (const field of ranges) {
    const range = setRanges(query, field);
    if (range) filter[field] = range;

  }

  const sortBy = allowedSort.has(String(query.sortBy)) ? query.sortBy : "ts";
  const order = query.order?.toLowerCase() === "asc" ? 1 : -1;
  const sort = { [sortBy]: order };

  return { filter, sort, sortBy, order };
}
