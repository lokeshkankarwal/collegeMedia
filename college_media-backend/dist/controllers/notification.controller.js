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
                post: {
                    select: {
                        id: true,
                        content: true,
                    },
                },
            },
        });
        res.json(notifications);
    }
    catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const markRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const recipientId = req.userId;
        const result = await prisma.notification.updateMany({
            where: {
                id: notificationId,
                recipientId,
            },
            data: {
                isRead: true,
            },
        });
        if (result.count === 0) {
            res.status(404).json({
                message: "Notification not found or unauthorized",
            });
            return;
        }
        res.json({
            message: "Notification marked as read",
        });
    }
    catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const markAllRead = async (req, res) => {
    try {
        const recipientId = req.userId;
        await prisma.notification.updateMany({
            where: {
                recipientId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
        res.json({
            message: "All notifications marked as read",
        });
    }
    catch (error) {
        console.error("Mark all read error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
//# sourceMappingURL=notification.controller.js.map