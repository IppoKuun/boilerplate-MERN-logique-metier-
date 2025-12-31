import config from "../../env.js"


export default async function logout(req, res) {
  const sessName = config?.session?.sessionName || "sid";
  const c = config?.session?.cookie || {};

  const clearOpts = {
    path: c.path || "/",
    domain: c.domain || undefined,
    sameSite: c.sameSite,
    secure: c.secure,
    httpOnly: c.httpOnly,
  };

  
  if (!req.session) {
    req.clearCookie(sessName, clearOpts);
    return res.status(200).json({ ok: true });
  }

  await new Promise((resolve, reject) =>
    req.session.destroy(err => (err ? reject(err) : resolve()))
  );

  res.clearCookie(sessName, clearOpts);
  return res.status(200).json({ ok: true });
}
