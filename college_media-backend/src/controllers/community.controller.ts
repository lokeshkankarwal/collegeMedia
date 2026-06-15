import type {
  Request,
  Response,
} from "express";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import prisma from "../lib/prisma.js";

export const createCommunity =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        name,
        description,
      } = req.body;

      if (!name) {
        res.status(400).json({
          message:
            "Community name required",
        });

        return;
      }

      const existingCommunity =
        await prisma.community.findUnique({
          where: {
            name,
          },
        });

      if (existingCommunity) {
        res.status(409).json({
          message:
            "Community already exists",
        });

        return;
      }

      const community =
        await prisma.community.create({
          data: {
            name,
            description,
          },
        });

      res.status(201).json(
        community
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Internal Server Error",
      });
    }
  };


export const getCommunities =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const communities =
        await prisma.community.findMany({
          include: {
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

      res.json(communities);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Internal Server Error",
      });
    }
  };


  export const joinCommunity =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const communityId =
        req.params.communityId;

      const userId =
        req.userId!;

      const existingMember =
        await prisma.communityMember.findUnique({
          where: {
            userId_communityId: {
              userId,
              communityId,
            },
          },
        });

      if (existingMember) {
        res.status(400).json({
          message:
            "Already joined",
        });

        return;
      }

      const membership =
        await prisma.communityMember.create({
          data: {
            userId,
            communityId,
          },
        });

      res.status(201).json(
        membership
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Internal Server Error",
      });
    }
  };

export const leaveCommunity =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const communityId =
        req.params.communityId;

      const userId =
        req.userId!;

      await prisma.communityMember.deleteMany({
        where: {
          userId,
          communityId,
        },
      });

      res.json({
        message:
          "Left community",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Internal Server Error",
      });
    }
  };

export const getCommunity =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const communityId =
        req.params.communityId;

      const community =
        await prisma.community.findUnique({
          where: {
            id: communityId,
          },

          include: {
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
          message:
            "Community not found",
        });

        return;
      }

      res.json(community);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Internal Server Error",
      });
    }
  };


export const createCommunityPost =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const communityId =
        req.params.communityId;

      const { content } =
        req.body;

      if (!content) {
        res.status(400).json({
          message:
            "Content required",
        });

        return;
      }

      const isMember =
        await prisma.communityMember.findUnique({
          where: {
            userId_communityId: {
              userId:
                req.userId!,
              communityId,
            },
          },
        });

      if (!isMember) {
        res.status(403).json({
          message:
            "Join community first",
        });

        return;
      }

      const post =
        await prisma.post.create({
          data: {
            content,

            authorId:
              req.userId!,

            communityId,
          },
        });

      res.status(201).json(
        post
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Internal Server Error",
      });
    }
  };

export const getCommunityPosts =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const communityId =
        req.params.communityId;

      const posts =
        await prisma.post.findMany({
          where: {
            communityId,
          },

          orderBy: {
            createdAt:
              "desc",
          },

          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
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

      res.json(posts);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Internal Server Error",
      });
    }
  };