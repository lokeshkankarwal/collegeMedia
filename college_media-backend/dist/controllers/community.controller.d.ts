import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare const createCommunity: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCommunities: (req: AuthRequest, res: Response) => Promise<void>;
export declare const joinCommunity: (req: AuthRequest, res: Response) => Promise<void>;
export declare const leaveCommunity: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCommunity: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteCommunity: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createCommunityPost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCommunityPosts: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=community.controller.d.ts.map