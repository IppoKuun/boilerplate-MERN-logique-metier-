//backend/server.js//
import "express-async-errors"
import mongoose from "mongoose"
import express from "express"
import helmet from "helmet"
import config from "./env.js"
import session from "express-session"
import MongoStore from "connect-mongo"
import {auditRouter} from "./routes/auditRoutes.js"
import {productRouter} from "./routes/product.routes.js"

const MONGO_URL = process.env.MONGO_URL; // ou ta config
const PORT = process.env.PORT || 4000;

// logs utiles
mongoose.connection.on("connected", () => console.log("[db] connected event"));
mongoose.connection.on("error", (err) => console.error("[db] error event:", err));
mongoose.connection.on("disconnected", () => console.warn("[db] disconnected"));

async function connectMongo() {
  if (!MONGO_URL) throw new Error("MONGO_URL manquant");
  console.log("[db] Connecting to", MONGO_URL.replace(/:\/\/[^@]+@/, "://***:***@"));
  await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 10000 });
  console.log("[db] Connected to Mongo"); // 👈 ce log doit apparaître AVANT le listen
}

const app = express()

app.post("/api/cloudinary/sign", (req, res) => {
  const { folder } = req.body;
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = `timestamp=${timestamp}${folder ? `&folder=${folder}` : ""}${process.env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  res.json({ timestamp, signature, folder });
});
  

app.use("/product", productRouter)
app.use("/audits", auditRouter)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(helmet({ contentSecurityPolicy: false }));


//Si TRUST Proxy existe on l'utilise///
if (config.TRUST_PROXY){app.set("trust proxy", config.TRUST_PROXY)}

//On Store la session dans la DB comme le cookies//
const mongoSession = MongoStore.create({
  mongoUrl: config.MONGO.Url, 
  ttl: config.session.cookie.maxAge / 1000
});

app.use(helmet({
  frameguard: { action: 'sameorigin' },
  contentSecurityPolicy: false, // On configure manuellement si besoin
  xContentTypeOptions: true, // nosniff activé
}));

app.use(
    session({
            name: config.session.sessionName,            // nom du cookie (ex: sid_admin)
    secret: config.session.secret,              // pour signer le cookie
    resave: false,                              // ne réécris pas si rien n’a changé
    saveUninitialized: false,                   // pas de session vide
    store: mongoSession,
    cookie: {
      maxAge: config.session.cookie.maxAge,     // durée de vie (ex: 2h)
      httpOnly: config.session.cookie.httpOnly, // inaccessible au JS navigateur
      sameSite: config.session.cookie.sameSite, // 'lax' (same-site) ou 'none'
      secure: config.session.cookie.secure,     // true en prod HTTPS (obligatoire si 'none')
      domain: config.session.cookie.domain,     // souvent vide → host-only (plus sûr)
      path: config.session.cookie.path,}
    })
)

app.get("/health", (req, res) => {
    res.json({ok: true, env:config.env, db:mongoose.connection.readyState === 1 ?"up" : "down" })
})

app.use((req, res) => res.status(404).json({ error: "Not Found" }));
app.use((err, req, res, next) => {
    const status = err.status || 500
    const isProd= config.IS_PROD
     const payload = {
    status,
    error: err.publicMessage || err.message || "Bug serveur interne",
    ...(isProd ? {} : { stack: err.stack }), // stack visible seulement en dev
  };

  res.status(status).json(payload);
    })


async function start(){
    try{
        await connectMongo();
    app.listen(config.PORT, () => {
      console.log(
        `[server] Listening on http://localhost:${config.PORT} (env=${config.env})`
      );
    });
  } catch (e) {
    console.error("[startup] Failed to start server:", e);
    process.exit(1);
  }
}

  start();


export default app;
