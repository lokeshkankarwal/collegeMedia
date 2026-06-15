import { Router } from "express";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

import {
  toggleLike,
} from "../controllers/like.controller.js";

const router = Router();

router.post(
  "/:postId",
  authenticate,
  toggleLike
);

export default router;