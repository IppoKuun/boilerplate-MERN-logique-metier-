import config from "../../env.js"


export default function logout (req, res, next) {
    const sessName = config?.session?.name || "sid"
    const cookie = config?.cookie?.name || {}


    const clearOpts = {
    path: c.path || "/",
    domain: c.domain || undefined,
    sameSite: c.sameSite,
    secure: c.secure,
    httpOnly: c.httpOnly,
    };

    if(!session){
        res.clearCookie(sessName, clearOpts)
        return res.status(200).json({ ok: true });
    }

    await new Promise((reject, resolve)=>{
        config.session.destroy(err => (err ? reject(err) : resolve()))
    })
       
    res.clearCookie(sessName, clearOpts);

    return res.status(200).json({ ok: true });
}