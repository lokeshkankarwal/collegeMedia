import type { Response } from "express";

import prisma from "../lib/prisma.js";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

export const followUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const followingId =
      req.params.userId as string;

    const followerId =
      req.userId!;

    if (followerId === followingId) {
      res.status(400).json({
        message:
          "Cannot follow yourself",
      });

      return;
    }

    const existingFollow =
      await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

    if (existingFollow) {
      res.status(400).json({
        message:
          "Already following",
      });

      return;
    }

    const follow =
      await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
    
      await prisma.notification.create({
  data: {
    recipientId: followingId,

    senderId: followerId,

    type: "FOLLOW",
  },
});

    res.status(201).json(follow);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Internal Server Error",
    });
  }
};

export const unfollowUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const followingId =
      req.params.userId as string;

    const followerId =
      req.userId!;

    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });

    res.json({
      message:
        "Unfollowed successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Internal Server Error",
    });
  }
};