export function checkOrigin(req, res, next) {
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next();

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const allowed = process.env.FRONTEND_URL || 'http://localhost:3000';

  if ((origin && origin !== allowed) || (referer && !referer.startsWith(allowed))) {
    return res.status(403).json({ error: 'CSRF detected' });
  }
  next();
}
