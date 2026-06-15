import { Router } from "express";
import { getMe, updateMe, searchUsers, getUserProfile, getUserPosts } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
const router = Router();
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);
router.get("/search", searchUsers);
router.get("/:userId", getUserProfile);
router.get("/:userId/posts", getUserPosts);
export default router;
//# sourceMappingURL=user.routes.js.map