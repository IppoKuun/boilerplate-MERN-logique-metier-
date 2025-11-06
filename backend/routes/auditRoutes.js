import { Router } from "express";
import AuditsEvents from "../models/AuditsEvents";
import {pagination, buildMeta} from "../utils/pagination"
import queryBuilder from "../utils/queryBuilder"

export const auditRouter = Router()


auditRouter.get("/",   async(req, res) => {
 const { filter, sort, sortBy, order } =   queryBuilder(req.query, {
            allowedSort : new Set (["actor.user", "target.slug", "events"]),
            equals : new Set (["actor.user", "target.slug", "events"]),
            ranges : new Set (["ts"]),
        }) 
            const {page, limit, skip} =  pagination(req.query, { defaultLimit: 50, maxLimit: 200 });

            const [items, total] = await Promise.all([
            AuditsEvents.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            AuditsEvents.countDocuments(filter)
        ])
          res.json({ items, meta: buildMeta({ page, limit, total, sortBy, order }) });
    })


