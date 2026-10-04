import { Router } from "express";
import {
  getNotifications,
  markRead,
  markAllRead,
} from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getNotifications);
router.patch("/read", authenticate, markAllRead);
router.patch("/:id/read", authenticate, markRead);

export default router;
