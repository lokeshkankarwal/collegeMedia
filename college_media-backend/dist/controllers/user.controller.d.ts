import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare const getMe: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateMe: (req: AuthRequest, res: Response) => Promise<void>;
export declare const searchUsers: (req: Request, res: Response) => Promise<void>;
export declare const getUserProfile: (req: Request, res: Response) => Promise<void>;
export declare const getUserPosts: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map