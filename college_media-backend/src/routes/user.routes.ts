import { Router } from "express";
import {
  getMe,
  updateMe,
  searchUsers,
  getUserProfile,
  getUserPosts,
  getUserFollowers,
  getUserFollowing,
} from "../controllers/user.controller.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);
router.get("/search", searchUsers);
router.get("/:userId", optionalAuthenticate, getUserProfile);
router.get("/:userId/posts", getUserPosts);
router.get("/:userId/followers", optionalAuthenticate, getUserFollowers);
router.get("/:userId/following", optionalAuthenticate, getUserFollowing);

export default router;
