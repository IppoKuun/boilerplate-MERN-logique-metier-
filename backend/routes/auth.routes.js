import { Router } from "react-router-dom";
import login from "../controllers/auth/login";
import logout from "../controllers/auth/logout";
const Router = Router()

Router.post("/login", login)
Router.post("/logout", logout)
Router.get("/me", requireAuth(), (res, req) => {
    return res.status(200).json({user: req.user})
})