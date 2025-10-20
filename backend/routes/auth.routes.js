import { Router } from "express";
import login from "../controllers/auth/login";
import logout from "../controllers/auth/logout";
import {loginRateLimiter} from  "../middlewares/rateLimits";

const authRouter = Router()

authRouter.post("/login", login, loginRateLimiter)
authRouter.post("/logout", logout)
authRouter.get("/me", requireAuth(), (res, req) => {
    return res.status(200).json({user: req.user})
})

module.exports = authRouter