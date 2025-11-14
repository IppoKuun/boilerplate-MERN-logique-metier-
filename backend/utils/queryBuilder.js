const toNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : undefined; };

function setRanges(query, field) {
  const obj = query?.[field];
  const min = (obj && toNum(obj.min)) ?? toNum(query?.[`${field}[min]`]) ?? toNum(query?.[`${field}.min`]);
  const max = (obj && toNum(obj.max)) ?? toNum(query?.[`${field}[max]`]) ?? toNum(query?.[`${field}.max`]);
  const out = {};
  if (min != null) out.$gte = min;
  if (max != null) out.$lte = max;
  return Object.keys(out).length ? out : undefined;
}

export function queryBuilder(query = {}, {
  allowedSort = new Set(["price","createdAt","updatedAt","name","ts","actor.user","target.slug","event"]),
  equals = new Set(["category","slug","name","event","target.slug","target.id","actor.user","actor.role","actor.id","CorrelationId"]),
  ranges = new Set(["price","createdAt","updatedAt","ts","diff.size"]),
} = {}) {
  const filter = {};

  for (const field of equals) {
    const value = query[field];
    if (value !== undefined && value !== "") filter[field] = value;
  }

  for (const field of ranges) {
    const r = setRanges(query, field);
    if (r) filter[field] = r;
  }

  const sortBy = allowedSort.has(String(query.sortBy)) ? query.sortBy : "createdAt";
  const order = query.order?.toLowerCase() === "asc" ? 1 : -1;
  const sort = { [sortBy]: order };

  return { filter, sort, sortBy, order };
}
