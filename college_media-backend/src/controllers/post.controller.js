import prisma from "../lib/prisma.js";
// ==========================================
// 1. CREATE POST
// ==========================================
export const createPost = async (req, res) => {
    try {
        const { content, imageUrl } = req.body;
        if (!content && !imageUrl) {
            res.status(400).json({
                message: "Content or image is required",
            });
            return;
        }
        const post = await prisma.post.create({
            data: {
                content,
                imageUrl,
                authorId: req.userId,
            },
        });
        res.status(201).json(post);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
// ==========================================
// 2. GET POSTS (FEED TIMELINE)
// ==========================================
export const getPosts = async (req, // 🛠️ Fixed: Now uses the Express Request type interface
res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const posts = await prisma.post.findMany({
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
                        branch: true,
                        year: true,
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
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            author: post.author,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
        }));
        res.status(200).json({
            page,
            limit,
            posts: formattedPosts,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
// ==========================================
// 3. LIKE POST
// ==========================================
export const likePost = async (req, res) => {
    try {
        // 🛠️ Fixed: Explicit type assertion to guarantee strict string compilation
        const postId = req.params.postId;
        console.log("Liking post:", postId, "by user:", req.userId);
        const existingLike = await prisma.like.findFirst({
            where: {
                userId: req.userId, // 🛠️ Fixed: Added non-null assertion operator
                postId,
            },
        });
        if (existingLike) {
            res.status(400).json({
                message: "Already liked",
            });
            return;
        }
        const like = await prisma.like.create({
            data: {
                userId: req.userId,
                postId,
            },
        });
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
        });
        if (post && post.authorId !== req.userId) {
            await prisma.notification.create({
                data: {
                    recipientId: post.authorId,
                    senderId: req.userId,
                    postId,
                    type: "LIKE",
                },
            });
        }
        res.status(201).json(like);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
// ==========================================
// 4. UNLIKE POST
// ==========================================
export const unlikePost = async (req, res) => {
    try {
        // 1. Force extract the parameter as a strict string
        const postId = req.params.postId;
        await prisma.like.deleteMany({
            where: {
                userId: req.userId, // 2. Add the exclamation mark assertion here
                postId,
            },
        });
        res.json({
            message: "Post unliked",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
// ==========================================
// 5. ADD COMMENT
// ==========================================
export const addComment = async (req, res) => {
    try {
        const postId = req.params.postId;
        const { content } = req.body;
        if (!content) {
            res.status(400).json({
                message: "Comment required",
            });
            return;
        }
        const comment = await prisma.comment.create({
            data: {
                content,
                userId: req.userId,
                postId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        branch: true,
                        year: true,
                    },
                },
            },
        });
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
        });
        if (post && post.authorId !== req.userId) {
            await prisma.notification.create({
                data: {
                    recipientId: post.authorId,
                    senderId: req.userId,
                    postId,
                    type: "COMMENT",
                },
            });
        }
        res.status(201).json(comment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
// ==========================================
// 6. GET COMMENTS
// ==========================================
export const getComments = async (req, // 🛠️ Fixed: Uses standard Express Request type signature
res) => {
    try {
        const postId = req.params.postId;
        const comments = await prisma.comment.findMany({
            where: {
                postId,
            },
            include: {
                user: {
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
        res.json(comments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
// ==========================================
// 7. UPDATE POST
// ==========================================
export const updatePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const { content } = req.body;
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
        });
        if (!post) {
            res.status(404).json({
                message: "Post not found",
            });
            return;
        }
        if (post.authorId !== req.userId) {
            res.status(403).json({
                message: "Unauthorized",
            });
            return;
        }
        const updatedPost = await prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                content,
            },
        });
        res.json(updatedPost);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
// ==========================================
// 8. DELETE POST
// ==========================================
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
        });
        if (!post) {
            res.status(404).json({
                message: "Post not found",
            });
            return;
        }
        if (post.authorId !== req.userId) {
            res.status(403).json({
                message: "Unauthorized",
            });
            return;
        }
        await prisma.post.delete({
            where: {
                id: postId,
            },
        });
        res.json({
            message: "Post deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
//# sourceMappingURL=post.controller.js.map