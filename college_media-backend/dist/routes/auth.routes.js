import { Router } from "express";
import { register, refresh, login, logout, forgotPassword, resetPassword, } from "../controllers/auth.controller.js";
const router = Router();
router.post("/register", register);
router.post("/refresh", refresh);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
export default router;
//# sourceMappingURL=auth.routes.js.map