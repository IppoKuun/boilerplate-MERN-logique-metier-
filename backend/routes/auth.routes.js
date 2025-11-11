import { Router } from "express";
import login from "../controllers/auth/login.js";
import logout from "../controllers/auth/logout.js";
import {loginRateLimiter} from  "../middlewares/rateLimits.js";

export const authRouter = Router()

authRouter.post("/login", loginRateLimiter, login )
authRouter.post("/logout", logout)
authRouter.get("/me", requireAuth(), (req, res) => {
    return res.status(200).json({user: req.user})
})

