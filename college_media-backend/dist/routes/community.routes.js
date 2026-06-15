import { Router } from "express";
import { createCommunity, getCommunities, joinCommunity, leaveCommunity, getCommunity, getCommunityPosts, createCommunityPost } from "../controllers/community.controller.js";
import { authenticate, } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/", authenticate, createCommunity);
router.get("/", getCommunities);
router.post("/:communityId/join", authenticate, joinCommunity);
router.delete("/:communityId/join", authenticate, leaveCommunity);
router.get("/:communityId", getCommunity);
router.post("/:communityId/posts", authenticate, createCommunityPost);
router.get("/:communityId/posts", getCommunityPosts);
export default router;
//# sourceMappingURL=community.routes.js.map