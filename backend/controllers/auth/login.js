import User from "../../models/User.js"

export default async function login (req, res, next) {
  try {
    const AUTH_ERR = { err: "Erreur d'authentification" }
    const { username, password } = req.body || {}

    // Check inputs
    if (!username || !password) {
      return res.status(400).json({ error: "Identifiants requis" })
    }

    // User lookup
    const user = await User.findOne({ username })
      .select("+username +passwordHash +role +displayName +status")

    // Harmonise ta logique d'état:
      if (!user || user.status === "suspendu") {
        return res.status(400).json({ error: AUTH_ERR.err })
      }


    const ok = await user.checkPassword(password)
    if (!ok) return res.status(400).json({ error: AUTH_ERR.err })

    // Session must exist (middleware express-session monté)
    if (!req.session) {
      return res.status(500).json({ error: "Session non initialisée (middleware manquant)" })
    }

    // Regenerate pour prévenir fixation de session
    await new Promise((resolve, reject) =>
      req.session.regenerate(err => err ? reject(err) : resolve())
    )

    req.session.user = {
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      status: user.status,
    }

    return res.status(200).json({ user: req.session.user })
  } catch (err) {
    return next(err)
  }
}
