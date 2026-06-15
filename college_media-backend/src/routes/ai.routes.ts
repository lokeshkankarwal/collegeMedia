import { Router } from "express";

import {
  generatePost,
} from "../controllers/ai.controller.js";

const router = Router();

router.post(
  "/generate-post",
  generatePost
);


export default router;