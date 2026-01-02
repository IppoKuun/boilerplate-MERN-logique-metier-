const rawWhitelist = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = rawWhitelist
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

export function checkOrigin(req, res, next) {
  const method = req.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return next();

  const origin = (req.headers.origin || "").replace(/\/$/, "");
  const referer = (req.headers.referer || "").replace(/\/$/, "");

  const originOk = !origin || allowedOrigins.includes(origin);
  const refererOk =
    !referer ||
    allowedOrigins.some((allowed) => referer === allowed || referer.startsWith(`${allowed}/`));

  if (!originOk || !refererOk) {
    return res.status(403).json({ error: "CSRF detected" });
  }
  next();
}
