import { Router } from "express";
import { generatePost, generateBio, } from "../controllers/ai.controller.js";
import { optionalAuthenticate } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/generate-post", optionalAuthenticate, generatePost);
router.post("/generate-bio", optionalAuthenticate, generateBio);
export default router;
//# sourceMappingURL=ai.routes.js.map