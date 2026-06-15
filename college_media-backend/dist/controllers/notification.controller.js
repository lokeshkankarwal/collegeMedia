import prisma from "../lib/prisma.js";
export const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                recipientId: req.userId,
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const markRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        await prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                isRead: true,
            },
        });
        res.json({
            message: "Notification read",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
//# sourceMappingURL=notification.controller.js.map