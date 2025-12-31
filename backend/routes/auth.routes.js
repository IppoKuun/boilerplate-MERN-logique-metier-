import { Router } from "express";
import login from "../controllers/auth/login.js";
import logout from "../controllers/auth/logout.js";
import {loginRateLimiter} from  "../middlewares/rateLimits.js";
import requireAuth from "../middlewares/requireAuth.js";
import { checkOrigin } from "../middlewares/CSRF.js";


export const authRouter = Router()

authRouter.post("/login", checkOrigin, loginRateLimiter, login )
authRouter.post("/logout", checkOrigin, logout)
authRouter.get("/me", requireAuth(), (req, res) => {
    return res.status(200).json({user: req.user})
})
