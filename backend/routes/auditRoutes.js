import { Router } from "epxress";
import AuditsEvents from "../models/AuditsEvents";
import requireAuth from "../middlewares/requireAuth";
import {pagination, buildMeta} from "../utils/pagination"
import queryBuilder from "../utils/queryBuilder"

const router = router()

router.get("/", pagination({
    defaultLimit : 50, maxLimit : 100
}), queryBuilder({
                allowedSort : new Set (["actor.user", "taget.slug"]),
            equals : new Set (["actor.user", "target.slug"]),
            ranges : new Set (["ts"]),
}))