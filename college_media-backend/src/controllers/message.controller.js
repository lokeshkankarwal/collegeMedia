import prisma from "../lib/prisma.js";
export const getConversation = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.userId;
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    {
                        senderId: currentUserId,
                        receiverId: otherUserId,
                    },
                    {
                        senderId: otherUserId,
                        receiverId: currentUserId,
                    },
                ],
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        res.json(messages);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
//# sourceMappingURL=message.controller.js.map