// models/AuditEvent.js (ESM)
import mongoose from "mongoose";

const AuditEventSchema = new mongoose.Schema({
  ts:   { type: Date, default: () => new Date(), index: true },
  event:{ type: String, required: true, index: true },     // ex: "product.update"
  actor:{                                                   // QUI
    id: String, role: String, },
  target:{ type: { type: String }, id: String, slug: String }, // QUOI
  source:{ via: String, ip: String, ua: String },           // UI/API/JOB + IP/UA
  reason: String,
  diff: mongoose.Schema.Types.Mixed,
  correlationId: String
}, { versionKey: false });

AuditEventSchema.index({ "target.id": 1, ts: -1 });
AuditEventSchema.index({ "actor.id": 1, ts: -1 });
// Option rétention auto (à valider avec le client)
// AuditEventSchema.index({ ts: 1 }, { expireAfterSeconds: 60*60*24*90 });

export default mongoose.model("AuditEvent", AuditEventSchema, "audit_events");


// utils/audit.js
import AuditEvent from "../models/AuditEvent.js";

export async function audit(req, payload) {
  const base = {
    ts: new Date(),
    actor: {
      id:   req.user?.id || req.user?.username || req.session?.user?.username || "anonymous",
      role: req.user?.role || req.session?.user?.role || "unknown",
    },
    source: {
      via: req.apiKey ? "api" : "ui",
      ip:  req.ip,
      ua:  req.headers["user-agent"] || "unknown",
    },
    correlationId: req.id || req.headers["x-request-id"] || null,
    ...payload,
  };

  try {
    await AuditEvent.create(base);   // ⬅️ écrit en base
  } catch (e) {
    // fallback console si la base refuse (pour ne rien perdre en dev)
    console.log("[audit-fallback]", JSON.stringify(base));
  }
}


// routes/admin.audit.routes.js
import { Router } from "express";
import requireAuth from "../middlewares/requireAuth.js";
import AuditEvent from "../models/AuditEvent.js";
import { queryBuilder } from "../utils/queryBuilder.js";
import { pagination, buildMeta } from "../utils/pagination.js";

const r = Router();

r.get("/audit", requireAuth(["owner","superadmin"]), async (req, res) => {
  // Filtrage/tri (prévois "ts" en range)
  const { filter, sort, sortBy, order } = queryBuilder(req.query, {
    equals: new Set(["event", "actor.id", "target.id"]),
    ranges: new Set(["ts"]),
    allowedSort: new Set(["ts"]),
  });

  const { page, limit, skip } = pagination(req.query, { defaultLimit: 50, maxLimit: 200 });

  const [items, total] = await Promise.all([
    AuditEvent.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    AuditEvent.countDocuments(filter),
  ]);

  res.json({ items, meta: buildMeta({ page, limit, total, sortBy, order }) });
});

export default r;


// + OUBLIE PAS DE MODIFIE CONTROLLEUR ET SERVEUR. JS//
