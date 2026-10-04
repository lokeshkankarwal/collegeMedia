import { Router }
from "express";

import {
  getConversation,
} from "../controllers/message.controller.js";
import {
  deleteMessage,
} from "../controllers/conversation.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/:userId",
  authenticate,
  getConversation
);

router.delete(
  "/:messageId",
  authenticate,
  deleteMessage
);

export default router;