import AuditsEvents from "../models/AuditEvents.js"

export default async function audit(req, payload){
    const base = {
        ts : Date.now(),
        actor: {
        id : req.user?.id || "Inconnu",
        user: req.user?.username || req.session?.user?.username || req?.session?.user.displayName || "Inconnu",
        role: req.user.role || req.session?.user?.role || " Inconnu",
        ip:  req.ip,
        ua:  req.headers["user-agent"] || "unknown",
        },
        correlationId: req.id || req.headers["x-request-id"] || null,
        ...payload
    } 

    try{
        AuditsEvents.create(base)
    } catch(e){
        console.log("[MongoDB], l'audit ne s'est pas enregistré sur MongoDB")
    }
}