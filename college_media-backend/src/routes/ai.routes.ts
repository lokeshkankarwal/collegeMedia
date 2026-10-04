import { Router } from "express";

import {
  generatePost,
  generateBio,
} from "../controllers/ai.controller.js";

const router = Router();

router.post("/generate-post", generatePost);
router.post("/generate-bio", generateBio);


export default router;