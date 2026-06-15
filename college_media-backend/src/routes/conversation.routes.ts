import { Router } from "express";

import {
  createConversation,
  getMyConversations,
  getMessages,
  createGroupConversation
} from "../controllers/conversation.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  createConversation
);

router.get(
  "/",
  authenticate,
  getMyConversations
);

router.get(
  "/:conversationId/messages",
  authenticate,
  getMessages
);

router.post(
  "/group",
  authenticate,
  createGroupConversation
);

export default router;