import prisma from "../lib/prisma.js";
export const getFeed = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const currentUserId = req.userId;
        const followingCount = await prisma.follow.count({
            where: {
                followerId: currentUserId,
            },
        });
        const whereClause = {
            communityId: null,
        };
        if (followingCount > 0) {
            whereClause.OR = [
                { authorId: currentUserId },
                {
                    author: {
                        followers: {
                            some: {
                                followerId: currentUserId,
                            },
                        },
                    },
                },
            ];
        }
        const feedPosts = await prisma.post.findMany({
            where: whereClause,
            skip,
            take: limit,
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
        const posts = feedPosts.map((post) => ({
            ...post,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
        }));
        res.status(200).json({
            page,
            posts,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
//# sourceMappingURL=feed.controller.js.map