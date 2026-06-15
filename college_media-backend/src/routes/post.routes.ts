import { Router } from "express";

import {
  createPost,
    getPosts,
    likePost,
    unlikePost,
    addComment,
    getComments,
    updatePost,
    deletePost
} from "../controllers/post.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  createPost
);
router.post(
  "/:postId/like",
  authenticate,
  likePost
);
router.delete(
  "/:postId/like",
  authenticate,
  unlikePost
);
router.post(
    "/:postId/comments",
    authenticate,
    addComment
    );
router.get(
    "/:postId/comments",
    getComments
    );
router.put(
  "/:postId",
  authenticate,
  updatePost
);

router.delete(
  "/:postId",
  authenticate,
  deletePost
);

router.get("/", getPosts);


export default router;