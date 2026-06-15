import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
export declare const createConversation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMessages: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyConversations: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createGroupConversation: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=conversation.controller.d.ts.map