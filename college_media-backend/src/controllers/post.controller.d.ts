import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare const createPost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPosts: (req: Request, // 🛠️ Fixed: Now uses the Express Request type interface
res: Response) => Promise<void>;
export declare const likePost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const unlikePost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addComment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getComments: (req: Request, // 🛠️ Fixed: Uses standard Express Request type signature
res: Response) => Promise<void>;
export declare const updatePost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deletePost: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=post.controller.d.ts.map