
const toString = Object.prototype.toString;
const hasOwn = Object.prototype.hasOwnProperty;

export const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function isPlainObject(v) {
  return toString.call(v) === "[object Object]";
}

export function isDangerousKey(key) {
  // NOTE: on préfère refuser les clés vides et celles avec null byte
  return (
    typeof key !== "string" ||
    key.length === 0 ||
    key.includes("\0") ||
    FORBIDDEN_KEYS.has(key) ||
    key.startsWith("$") ||
    key.includes(".")
  );
}

// ——— 1) Nettoyage profond (objets + arrays)
export function sanitizeObject(value) {
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeObject(v));
  }
  if (isPlainObject(value)) {
    const out = {};
    for (const k of Object.keys(value)) {
      if (isDangerousKey(k)) continue;
      out[k] = sanitizeObject(value[k]);
    }
    return out;
  }
  // Primitifs / Date / Buffer / etc. -> renvoi tel quel
  return value;
}

// suppose: req.body a déjà été passé dans sanitize() + Joi
export function buildSafePatch(obj, allowedPaths) {
  const patch = {};
  for (const path of allowedPaths) {
    if (typeof path !== "string" || !path) continue;
    // chemins de type "a.b.c" (sans indices de tableau)
    const parts = path.split(".");
    let cursor = obj;
    for (const p of parts) {
      if (!cursor || typeof cursor !== "object") { cursor = undefined; break; }
      cursor = cursor[p];
    }
    if (cursor !== undefined) patch[path] = cursor;
  }
  return patch;
}


// ——— 4) pick top-level (utile pour formater une réponse DTO sans Mongo)
export function pick(obj, keys) {
  if (!isPlainObject(obj)) return {};
  const out = {};
  for (const key of keys) {
    if (typeof key !== "string" || isDangerousKey(key)) continue;
    if (hasOwn.call(obj, key)) {
      out[key] = obj[key];
    }
  }
  return out;
}
