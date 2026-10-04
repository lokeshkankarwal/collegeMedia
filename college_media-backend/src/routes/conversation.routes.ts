import { Router } from "express";
import {
  createConversation,
  getMyConversations,
  getConversation,
  getMessages,
  createGroupConversation,
  deleteConversation,
  updateGroupAdmin,
  addGroupMembers,
  removeGroupMember,
  deleteMessage,
} from "../controllers/conversation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, createConversation);
router.get("/", authenticate, getMyConversations);
router.get("/:conversationId", authenticate, getConversation);
router.get("/:conversationId/messages", authenticate, getMessages);
router.post("/group", authenticate, createGroupConversation);
router.delete("/:conversationId", authenticate, deleteConversation);
router.patch("/:conversationId/admins/:targetUserId", authenticate, updateGroupAdmin);
router.post("/:conversationId/members", authenticate, addGroupMembers);
router.delete("/:conversationId/members/:targetUserId", authenticate, removeGroupMember);
router.delete("/:conversationId/messages/:messageId", authenticate, deleteMessage);

export default router;
