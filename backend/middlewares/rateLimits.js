import { rateLimit, ipKeyGenerator } from "express-rate-limit";

function helper(res, retry) {
  res.setHeader("Retry-After", retry);
  return res.status(429).json({
    error: "Trop de tentatives",
    retryAfter: retry,
  });
}

export const loginRateLimiter = rateLimit({
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: false,
  validate: true,

  keyGenerator: (req) => {
    const ip = req.ip || req.socket?.remoteAddress || "Adresse inconnue";
    const username =
      typeof req.body?.username === "string"
        ? req.body.username.trim().toLowerCase()
        : "";

    // ✅ bonne syntaxe : nombre, pas objet
    const ipKey = ipKeyGenerator(ip, 64);

    return username ? `${ipKey}:${username}` : ipKey;
  },

  handler: (req, res, _next, options) => {
    const retry = Math.ceil(options.windowMs / 1000);
    console.log(
      `[RATE-LIMIT] Bloqué: IP=${req.ip}, User=${req.body?.username || "anon"}, Retry=${retry}s`
    );
    return helper(res, retry);
  },
});
