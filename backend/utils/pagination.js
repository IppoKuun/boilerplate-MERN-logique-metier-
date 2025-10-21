export function pagination(query = {}, { defaultLimit = 20, maxLimit = 100, defaultPage = 1 } = {}) {
  const toInt = (v, fallback) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : fallback;
  };

  const page = toInt(query.page, defaultPage);
  const rawLimit = toInt(query.limit, defaultLimit);
  const limit = Math.min(maxLimit, rawLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildMeta({ page, limit, total, sortBy, order }) {
  const pages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));
  const hasNext = page < pages;
  const hasPrev = page > 1;
  return { hasNext, hasPrev, page, limit, total, sortBy, order };
}
