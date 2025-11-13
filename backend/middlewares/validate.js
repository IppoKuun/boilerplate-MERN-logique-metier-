// backend/middlewares/validate.js
import buildSafePatch from "../utils/sanitize.js";


export default function validate(schemaMap = {}, options = {}) {
  const { coerce = true } = options;

  // Normalise allowedPaths -> string[]
  function normalizeAllowedPaths(ap) {
    if (Array.isArray(ap)) return ap;
    if (ap && typeof ap === "object") return Object.keys(ap);
    return [];
  }

  const allowed = normalizeAllowedPaths(options.allowedPaths);

  // Utilitaire: applique un schéma (Joi/Zod/fonction) et renvoie {ok,value,error}
  function applySchema(schema, data, where) {
    if (!schema) return { ok: true, value: data };

    // Joi
    if (typeof schema.validate === "function") {
      const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: false });
      return error ? { ok: false, error: error.message } : { ok: true, value };
    }

    // Zod
    if (typeof schema.safeParse === "function") {
      const r = schema.safeParse(data);
      if (!r.success) {
        const msg = r.error.errors?.map(e => `${e.path?.join(".") || ""}: ${e.message}`).join("; ") || "Invalid";
        return { ok: false, error: msg };
      }
      return { ok: true, value: r.data };
    }
    if (typeof schema.parse === "function") {
      try {
        const v = schema.parse(data);
        return { ok: true, value: v };
      } catch (e) {
        return { ok: false, error: e?.message || "Invalid" };
      }
    }

    // Fonction custom
    if (typeof schema === "function") {
      try {
        const r = schema(data);
        if (r && typeof r === "object" && "ok" in r) return r;
        return { ok: true, value: r };
      } catch (e) {
        return { ok: false, error: e?.message || "Invalid" };
      }
    }

    // Schéma inconnu -> ne rien bloquer
    return { ok: true, value: data };
  }

  return function validateMiddleware(req, res, next) {
    try {
      const method = req.method.toUpperCase();

      // 1) BODY: on ne nettoie/filtre que pour POST/PUT/PATCH
      if (method === "POST" || method === "PUT" || method === "PATCH") {
        // Filtrage des champs autorisés (robuste même si allowedPaths vide/mal typé)
        const safeBody = buildSafePatch(req.body, allowed);

        // Puis validation éventuelle du body
        const bodySchema = schemaMap.body;
        const { ok, value, error } = applySchema(bodySchema, safeBody, "body");
        if (!ok) {
          return res.status(400).json({ status: 400, error: `Body invalid: ${error}` });
        }
        if (coerce) req.body = value;
      } else {
        // GET/DELETE: ne jamais filtrer le body (ni le requérir)
        // mais on peut toujours valider query/params
      }

      // 2) QUERY
      if (schemaMap.query) {
        const r = applySchema(schemaMap.query, req.query, "query");
        if (!r.ok) return res.status(400).json({ status: 400, error: `Query invalid: ${r.error}` });
        if (coerce) req.query = r.value;
      }

      // 3) PARAMS
      if (schemaMap.params) {
        const r = applySchema(schemaMap.params, req.params, "params");
        if (!r.ok) return res.status(400).json({ status: 400, error: `Params invalid: ${r.error}` });
        if (coerce) req.params = r.value;
      }

      return next();
    } catch (err) {
      // Laisse le handler d'erreur global formater la réponse
      return next(err);
    }
  };
}
