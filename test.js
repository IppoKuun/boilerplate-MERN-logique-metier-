import BaseJoi from "joi";
import sanitize from "./sanitizeFilter.js"; // <-- guillemets + nom corrigé

export const Joi = BaseJoi;

const DEFAULT_JOI = Object.freeze({
  convert: true,
  abortEarly: false,
  stripUnknown: true,
  allowUnknown: false,
});

function formatJoiError(err) {
  if (!err?.details) return [];
  return err.details.map((e) => ({
    path: Array.isArray(e.path) ? e.path.join(".") : String(e.path ?? ""),
    message: String(e.message || "").replace(/["]/g, "'"),
    type: e.type || "validation.error",
  }));
}

export default function validate(schemaMap = {}, options = {}) {
  // 1) Liste des parties à valider (uniquement celles qui ont un schéma)
  const parts = ["headers", "params", "query", "body"].filter((p) => schemaMap[p]);

  // 2) Si aucun schéma -> middleware no-op
  if (parts.length === 0) {
    return function noopValidate(_req, _res, next) {
      return next();
    };
  }

  // 3) Sanitize activé par défaut (tu peux passer { sanitize: false } si un jour tu veux le couper)
  const doSanitize = options.sanitize !== false;

  // 4) Options Joi (defaults + override éventuel dans options.joi)
  const baseJoiOpts = { ...DEFAULT_JOI, ...(options.joi || {}) };

  // 5) Le vrai middleware Express
  return function validateMiddleware(req, res, next) {
    for (const part of parts) {
      const schema = schemaMap[part];

      // a) Données brutes du client pour cette partie
      let input = req[part] ?? {};

      // b) Sanitize uniquement sur body/query/params (pas headers)
      if (
        doSanitize &&
        (part === "body" || part === "query" || part === "params")
      ) {
        input = sanitize(input);
      }

      // c) Options Joi : sur headers on autorise les clés inconnues
      const joiOpts =
        part === "headers" ? { ...baseJoiOpts, allowUnknown: true } : baseJoiOpts;

      // d) Validation
      const { error, value } = schema.validate(input, joiOpts);
      if (error) {
        return res.status(400).json({
          error: "Validation err",
          where: part,
          details: formatJoiError(error),
        });
      }

      // e) Remplacement par la version validée/épurée
      req[part] = value;
    }

    // f) Tout est OK -> on passe au contrôleur
    return next();
  };
}
