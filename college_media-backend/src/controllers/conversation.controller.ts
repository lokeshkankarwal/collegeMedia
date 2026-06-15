import type { Response } from "express";

import prisma from "../lib/prisma.js";

import type { AuthRequest } from "../middleware/auth.middleware.js";

export const createConversation = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = req.userId!;

    const { participantId } = req.body;

    if (!participantId) {
      res.status(400).json({
        message: "participantId is required",
      });

      return;
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: currentUserId,
              },
            },
          },
          {
            participants: {
              some: {
                userId: participantId,
              },
            },
          },
        ],
      },

      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (existingConversation) {
      res.json(existingConversation);

      return;
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            {
              userId: currentUserId,
            },
            {
              userId: participantId,
            },
          ],
        },
      },

      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    res.json(conversation);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const getMessages = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const conversationId = req.params.conversationId as string;

    console.log("Loading messages for:", conversationId);

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
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

      orderBy: {
        createdAt: "asc",
      },
    });

    console.log("Found messages:", messages.length);

    res.json(messages);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getMyConversations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId!;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },

      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },

        messages: {
          orderBy: {
            createdAt: "desc",
          },

          take: 1,
        },
      },

      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json(conversations);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const createGroupConversation = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = req.userId!;

    const { name, participants } = req.body;

    if (!name) {
  res.status(400).json({
    message: "Group name is required",
  });
  return;
}

if (
  !participants ||
  !Array.isArray(participants) ||
  participants.length === 0
) {
  res.status(400).json({
    message:
      "At least one group member is required",
  });
  return;
}

    const conversation = await prisma.conversation.create({
      data: {
        name,

        isGroup: true,

        participants: {
          create: [
            {
              userId: currentUserId,
            },

            ...participants.map((userId: string) => ({
              userId,
            })),
          ],
        },
      },

      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    res.json(conversation);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
