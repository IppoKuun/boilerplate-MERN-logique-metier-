import { rateLimit } from 'express-rate-limit';   

function helper (res, retry){
    return res.status(429).json({
        error: "Trop de tentatives",
        retryAfter: retry || undefined,
    })
}

export const loginRateLimiter =rateLimit ({
    standardHeaders:true,
    skipSuccessfulRequests: false,
    legacyHeaders: false,
    windowMs: 15*60*1000,
    max: 10,
    keyGenerator: (req) => {
        const ip = req.ip || req.socket?.remoteAddress || "Adresse inconnue"
        const username = typeof req.body?.username === "string" ? 
        req.body.username.trim().toLowerCase() : ""
        return username ? `${ip}:${username}` : ip
    },
    handler: (req, res, _next, options) => {
        const retry = Math.ceil((options.windowMs || 900_000) / 1000)
        return helper(res, retry)
    }
})