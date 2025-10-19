import { Router } from "express";
import login from "../controllers/auth/login";
import logout from "../controllers/auth/logout";
import {loginRateLimiter} from  "../middlewares/rateLimits";

const Router = Router()

Router.post("/login", login, loginRateLimiter)
Router.post("/logout", logout)
Router.get("/me", requireAuth(), (res, req) => {
    return res.status(200).json({user: req.user})
})