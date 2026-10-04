import { Router } from "express";
import { createCommunity, getCommunities, joinCommunity, leaveCommunity, getCommunity, createCommunityPost, getCommunityPosts, deleteCommunity, } from "../controllers/community.controller.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/", authenticate, createCommunity);
router.get("/", optionalAuthenticate, getCommunities);
router.get("/:communityId", optionalAuthenticate, getCommunity);
router.delete("/:communityId", authenticate, deleteCommunity);
router.post("/:communityId/join", authenticate, joinCommunity);
router.delete("/:communityId/join", authenticate, leaveCommunity);
router.post("/:communityId/posts", authenticate, createCommunityPost);
router.get("/:communityId/posts", optionalAuthenticate, getCommunityPosts);
export default router;
//# sourceMappingURL=community.routes.js.map