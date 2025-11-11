//backend/env.js//
import dotenv from "dotenv"
dotenv.config()

//helper pour parser
const helpers = {
    toBool(v, def = false){
        if (typeof v === "boolean") return v
        if (typeof v !== "string")return def
        const vClean = v.trim().toLowerCase()
        if (vClean === "true" || vClean === "1") return true
        if(vClean === "false" || vClean ===  "0") return false
        return def
    },
    toInt(v, def =0){
        const n = Number.parseInt(v, 10)
        return Number.isFinite(n) ? n : def;
    },

    toArray(v, def = []){
        if (typeof v !== "string" || !v.trim() )return def
        return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    },
}

//Choisir le mode
const NODE_ENV = process.env.NODE_ENV
const IS_PROD = NODE_ENV === "production"
//importer .env
const RAW = {
    PORT: process.env.PORT || "4000",
    NODE_ENV : process.env.NODE_ENV || "",
    MONGO_Url : process.env.MONGO_Url || "",
    SESSION_SECRET : process.env.SESSION_SECRET || "",
    COOKIE_SAME_SITE:process.env.COOKIE_SAME_SITE || "",
    COOKIE_SECURE:process.env.COOKIE_SECURE || "",  
    TRUST_PROXY: process.env.TRUST_PROXY || "",
    SESSION_MAX_AGE: process.env.SESSION_MAX_AGE || String(7*24*60*60),
    
}

//parser
const PORT = helpers.toInt(RAW.PORT, 4000)
const COOKIE_SECURE = IS_PROD;
const TRUST_PROXY = helpers.toBool(RAW.TRUST_PROXY, false);
const COOKIE_SAME_SITE = (RAW.COOKIE_SAME_SITE || "lax").trim().toLowerCase();
const SESSION_MAX_AGE_MS = helpers.toInt(RAW.SESSION_MAX_AGE, 7*24*60*60) * 1000;


if (IS_PROD) {
  if (!RAW.MONGO_Url) throw new Error("[ENV] MONGO_Url requis en production");
  if (!RAW.SESSION_SECRET) throw new Error("[ENV] SESSION_SECRET requis en production");
}
if (COOKIE_SAME_SITE === "none" && !COOKIE_SECURE) {
  throw new Error("[ENV] SameSite=None exige Secure=true (HTTPS)");
}


export const config = Object.freeze ({
    env: RAW.NODE_ENV,
    IS_PROD,
    PORT,
    TRUST_PROXY,
    MONGO:{
        Url: RAW.MONGO_Url},
        
    session: {
    secret: RAW.SESSION_SECRET || "dev-only-please-change",
    sessionName: RAW.SESSION_NAME || "sid",
    cookie: {
      maxAge: SESSION_MAX_AGE_MS,
      secure: COOKIE_SECURE,
      httpOnly: true,
      sameSite:COOKIE_SAME_SITE,       
      domain: RAW.COOKIE_DOMAIN || undefined,
      path: "/",
    },
  },
})

export default config;