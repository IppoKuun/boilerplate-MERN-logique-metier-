export default function requireAuth(roles = null) {
  return (req, res, next) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: "Veuillez vous connecter" });

    if (Array.isArray(roles) && roles.length > 0) {
      const role = String(user.role ?? "");
      if (!roles.includes(role)) {
        return res.status(403).json({ error: "Accès non autorisé" });
      }
    }

    req.user = user;
    if (req.session) {
      req.session.lastActivityAt = Date.now();
      req.session.lastIp = req.ip;
      req.session.lastUa = req.headers["user-agent"] || "Inconnu";
    }
    next();
  };
}
