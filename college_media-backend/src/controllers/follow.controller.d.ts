import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare const followUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const unfollowUser: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=follow.controller.d.ts.map