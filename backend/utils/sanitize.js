
export default function buildSafePatch(obj = {}, allowedPaths = []) {
  // --- Sécurisation des arguments -------------------------------------------
  if (typeof obj !== "object" || obj === null) obj = {};

  // Si allowedPaths n'est pas un tableau, on tente de le convertir
  if (!Array.isArray(allowedPaths)) {
    if (allowedPaths && typeof allowedPaths === "object") {
      // Si c'est un objet (ex: schema Joi), on prend ses clés
      allowedPaths = Object.keys(allowedPaths);
    } else {
      // Sinon on le remplace par un tableau vide
      allowedPaths = [];
    }
  }

  // --- Filtrage des propriétés autorisées -----------------------------------
  const safe = {};

  for (const path of allowedPaths) {
    if (typeof path !== "string" || !path) continue; // ignore entrées invalides
    if (Object.prototype.hasOwnProperty.call(obj, path)) {
      safe[path] = obj[path];
    }
  }

  return safe;
}
