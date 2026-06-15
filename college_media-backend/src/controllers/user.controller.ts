import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

// ==========================================
// 1. GET ME (CURRENT AUTHENTICATED USER)
// ==========================================
export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // 🛠️ Fixed: Use non-null assertion to assure TypeScript this protected route provides a string ID
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: {
        id: userId, // ✅ Clean and completely type-safe now
      },
      select: {
        id: true,
        name: true,
        email: true,
        branch: true,
        year: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// 2. UPDATE PROFILE DETAILS
// ==========================================
export const updateMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!; // 🛠️ Fixed: Asserting definite string signature

    const { bio, branch, year, avatarUrl } = req.body;
    
    if (year && typeof year !== "number") {
      res.status(400).json({
        message: "Year must be a number",
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        bio,
        branch,
        year,
        avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        branch: true,
        year: true,
        avatarUrl: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// 3. SEARCH USERS
// ==========================================
export const searchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = String(req.query.q || "");

    if (!query.trim()) {
      res.status(400).json({
        message: "Search query required",
      });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        branch: true,
        year: true,
      },
      take: 20,
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// 4. GET PUBLIC PROFILE VIEW METRICS
// ==========================================
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId as string; // 🛠️ Fixed: Explicitly typed route parameter extraction

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        branch: true,
        year: true,
        avatarUrl: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      bio: user.bio,
      branch: user.branch,
      year: user.year,
      avatarUrl: user.avatarUrl,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      postsCount: user._count.posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// 5. GET TARGET USER'S TIMELINE POSTS
// ==========================================
export const getUserPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId as string;

    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
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

    const formattedPosts = posts.map(
      (post: any) => ({
        ...post,
        likesCount: post._count.likes,
        commentsCount:
          post._count.comments,
      })
    );

    res.json(formattedPosts);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Internal Server Error",
    });
  }
};