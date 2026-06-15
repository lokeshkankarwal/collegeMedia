import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare const createCommunity: (req: Request, res: Response) => Promise<void>;
export declare const getCommunities: (req: Request, res: Response) => Promise<void>;
export declare const joinCommunity: (req: AuthRequest, res: Response) => Promise<void>;
export declare const leaveCommunity: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCommunity: (req: Request, res: Response) => Promise<void>;
export declare const createCommunityPost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCommunityPosts: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=community.controller.d.ts.map