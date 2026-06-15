import { Router } from "express";

import {
  getFeed,
} from "../controllers/feed.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  getFeed
);

export default router;