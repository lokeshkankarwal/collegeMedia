import type { Response } from "express";

import prisma from "../lib/prisma.js";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

export const getNotifications =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const notifications =
        await prisma.notification.findMany({
          where: {
            recipientId:
              req.userId as string,
          },

          orderBy: {
            createdAt: "desc",
          },

          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        });

      res.json(notifications);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Internal Server Error",
      });
    }
  };


export const markRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const notificationId =
      req.params.id as string;

    await prisma.notification.update({
      where: {
        id: notificationId,
      },

      data: {
        isRead: true,
      },
    });

    res.json({
      message:
        "Notification read",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Internal Server Error",
      });
  }
};