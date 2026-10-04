import prisma from "../lib/prisma.js";
export const toggleLike = async (req, res) => {
    try {
        const userId = req.userId;
        const postId = req.params.postId;
        const existingLike = await prisma.like.findFirst({
            where: {
                userId,
                postId,
            },
        });
        if (existingLike) {
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });
            return res.json({
                liked: false,
            });
        }
        await prisma.like.create({
            data: {
                userId,
                postId,
            },
        });
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true },
        });
        if (post && post.authorId !== userId) {
            await prisma.notification.create({
                data: {
                    recipientId: post.authorId,
                    senderId: userId,
                    type: "LIKE",
                    postId,
                },
            });
        }
        res.json({
            liked: true,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
//# sourceMappingURL=like.controller.js.map