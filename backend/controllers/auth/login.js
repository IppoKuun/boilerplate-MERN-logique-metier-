import config from "../../env.js"
import User from "../../models/User.js"

export default function login (req, res, next){
    const AUTH_ERR = {err: "Erreur d'authentification"}
    const {username, password} = req.body


    const user = await User.findOne({ username })
    .select("+username +passwordHash +isActive +role +displayName")
    if (!user || user.status ==="suspendu"){
        return res.status(400).json(err(AUTH_ERR))
    }

    const ok = await user.checkPassword(password)
    if (!ok) { return res.status(400).json(err(AUTH_ERR))}

    await new Promise((resolve, reject) => (
    req.session.regenerate(err => err ? reject(err) : resolve())))
    }
    

    req.session.user = ({
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        status: user.status,
    })
        return res.status(200).json({user: req.session.user})
}
