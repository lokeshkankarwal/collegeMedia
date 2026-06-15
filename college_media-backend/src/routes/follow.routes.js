import { Router } from "express";
import { followUser, unfollowUser, } from "../controllers/follow.controller.js";
import { authenticate, } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/:userId", authenticate, followUser);
router.delete("/:userId", authenticate, unfollowUser);
export default router;
//# sourceMappingURL=follow.routes.js.map