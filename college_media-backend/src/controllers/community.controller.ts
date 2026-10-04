import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import prisma from "../lib/prisma.js";

export const createCommunity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { name, description } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        message: "Community name is required",
      });
      return;
    }

    const trimmedName = name.trim();

    const existingCommunity = await prisma.community.findUnique({
      where: {
        name: trimmedName,
      },
    });

    if (existingCommunity) {
      res.status(409).json({
        message: "A community with this name already exists",
      });
      return;
    }

    const community = await prisma.community.create({
      data: {
        name: trimmedName,
        description: description ? String(description).trim() : null,
        ownerId: userId,
        members: {
          create: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    res.status(201).json({
      ...community,
      membersCount: community._count.members,
      postsCount: community._count.posts,
      isJoined: true,
      isOwner: true,
    });
  } catch (error) {
    console.error("Create community error:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getCommunities = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.userId;

    const communities = await prisma.community.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        members: currentUserId
          ? {
              where: {
                userId: currentUserId,
              },
              select: {
                userId: true,
              },
            }
          : false,
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = communities.map((community) => {
      const isJoined = currentUserId
        ? Boolean(community.members && community.members.length > 0)
        : false;
      const isOwner = currentUserId
        ? community.ownerId === currentUserId
        : false;

      return {
        id: community.id,
        name: community.name,
        description: community.description,
        createdAt: community.createdAt,
        ownerId: community.ownerId,
        owner: community.owner,
        membersCount: community._count.members,
        postsCount: community._count.posts,
        isJoined,
        isOwner,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Get communities error:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const joinCommunity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const communityId = req.params.communityId as string;
    const userId = req.userId!;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      res.status(404).json({
        message: "Community not found",
      });
      return;
    }

    const existingMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
    });

    if (existingMember) {
      res.status(400).json({
        message: "Already joined this community",
      });
      return;
    }

    const membership = await prisma.communityMember.create({
      data: {
        userId,
        communityId,
      },
    });

    res.status(201).json(membership);
  } catch (error) {
    console.error("Join community error:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const leaveCommunity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const communityId = req.params.communityId as string;
    const userId = req.userId!;

    await prisma.communityMember.deleteMany({
      where: {
        userId,
        communityId,
      },
    });

    res.json({
      message: "Left community",
    });
  } catch (error) {
    console.error("Leave community error:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getCommunity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const communityId = req.params.communityId as string;
    const currentUserId = req.userId;

    const community = await prisma.community.findUnique({
      where: {
        id: communityId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        members: {
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
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    if (!community) {
      res.status(404).json({
        message: "Community not found",
      });
      return;
    }

    const isJoined = currentUserId
      ? community.members.some((m) => m.userId === currentUserId)
      : false;
    const isOwner = currentUserId
      ? community.ownerId === currentUserId
      : false;

    res.json({
      id: community.id,
      name: community.name,
      description: community.description,
      createdAt: community.createdAt,
      ownerId: community.ownerId,
      owner: community.owner,
      membersCount: community._count.members,
      postsCount: community._count.posts,
      members: community.members.map((m) => m.user),
      isJoined,
      isOwner,
    });
  } catch (error) {
    console.error("Get community error:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteCommunity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const communityId = req.params.communityId as string;
    const currentUserId = req.userId!;

    const community = await prisma.community.findUnique({
      where: {
        id: communityId,
      },
    });

    if (!community) {
      res.status(404).json({
        message: "Community not found",
      });
      return;
    }

    // STRICT AUTHORIZATION CHECK: Only the community owner can delete it
    if (community.ownerId !== currentUserId) {
      res.status(403).json({
        message: "Forbidden: Only the community creator can delete this community",
      });
      return;
    }

    await prisma.community.delete({
      where: {
        id: communityId,
      },
    });

    res.json({
      message: "Community deleted successfully",
    });
  } catch (error) {
    console.error("Delete community error:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createCommunityPost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const communityId = req.params.communityId as string;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({
        message: "Post content is required",
      });
      return;
    }

    const isMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: req.userId!,
          communityId,
        },
      },
    });

    if (!isMember) {
      res.status(403).json({
        message: "You must join this community before posting",
      });
      return;
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: req.userId!,
        communityId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Create community post error:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getCommunityPosts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const communityId = req.params.communityId as string;

    const posts = await prisma.post.findMany({
      where: {
        communityId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => ({
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error("Get community posts error:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
