import { Router } from "express";
import { getConversation, } from "../controllers/message.controller.js";
import { authenticate, } from "../middleware/auth.middleware.js";
const router = Router();
router.get("/:userId", authenticate, getConversation);
export default router;
//# sourceMappingURL=message.routes.js.map