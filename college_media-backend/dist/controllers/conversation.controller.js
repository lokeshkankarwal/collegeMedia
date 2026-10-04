import prisma from "../lib/prisma.js";
export const createConversation = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const { participantId } = req.body;
        if (!participantId) {
            res.status(400).json({
                message: "participantId is required",
            });
            return;
        }
        if (currentUserId === participantId) {
            res.status(400).json({
                message: "Cannot create conversation with yourself",
            });
            return;
        }
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
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
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
        if (existingConversation) {
            // Un-delete conversation for current user if it was previously hidden/deleted
            await prisma.conversationParticipant.updateMany({
                where: {
                    conversationId: existingConversation.id,
                    userId: currentUserId,
                    isDeleted: true,
                },
                data: {
                    isDeleted: false,
                },
            });
            res.json(existingConversation);
            return;
        }
        const conversation = await prisma.conversation.create({
            data: {
                isGroup: false,
                creatorId: currentUserId,
                participants: {
                    create: [
                        {
                            userId: currentUserId,
                            isAdmin: true,
                        },
                        {
                            userId: participantId,
                            isAdmin: false,
                        },
                    ],
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
            },
        });
        res.json(conversation);
    }
    catch (error) {
        console.error("Create conversation error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const getMessages = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const currentUserId = req.userId;
        // Verify user is a participant
        const isParticipant = await prisma.conversationParticipant.findFirst({
            where: {
                conversationId,
                userId: currentUserId,
            },
        });
        if (!isParticipant) {
            res.status(403).json({
                message: "You are not a member of this conversation",
            });
            return;
        }
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
        res.json(messages);
    }
    catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const getMyConversations = async (req, res) => {
    try {
        const userId = req.userId;
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId,
                        isDeleted: false,
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
    }
    catch (error) {
        console.error("Get conversations error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const getConversation = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const userId = req.userId;
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
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
                                email: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
        if (!conversation) {
            res.status(404).json({
                message: "Conversation not found or access denied",
            });
            return;
        }
        res.json(conversation);
    }
    catch (error) {
        console.error("Get conversation details error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const createGroupConversation = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const { name, participants } = req.body;
        if (!name || typeof name !== "string" || !name.trim()) {
            res.status(400).json({
                message: "Group name is required",
            });
            return;
        }
        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            res.status(400).json({
                message: "At least one group member is required",
            });
            return;
        }
        // Filter out current user from participant list to avoid duplicate records
        const otherParticipantIds = Array.from(new Set(participants.filter((id) => id && id !== currentUserId)));
        const conversation = await prisma.conversation.create({
            data: {
                name: name.trim(),
                isGroup: true,
                creatorId: currentUserId,
                participants: {
                    create: [
                        {
                            userId: currentUserId,
                            isAdmin: true,
                        },
                        ...otherParticipantIds.map((userId) => ({
                            userId,
                            isAdmin: false,
                        })),
                    ],
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
            },
        });
        res.status(201).json(conversation);
    }
    catch (error) {
        console.error("Create group error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const deleteConversation = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const conversationId = req.params.conversationId;
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: currentUserId,
                },
            },
        });
        if (!participant) {
            res.status(403).json({
                message: "You are not a participant in this conversation",
            });
            return;
        }
        await prisma.conversationParticipant.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: currentUserId,
                },
            },
            data: {
                isDeleted: true,
            },
        });
        res.json({
            message: "Conversation removed from your chat list",
        });
    }
    catch (error) {
        console.error("Delete conversation error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const updateGroupAdmin = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const conversationId = req.params.conversationId;
        const targetUserId = req.params.targetUserId;
        const { isAdmin } = req.body;
        if (typeof isAdmin !== "boolean") {
            res.status(400).json({
                message: "isAdmin boolean flag is required",
            });
            return;
        }
        // 1. Verify conversation exists and is a group
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
            include: {
                participants: true,
            },
        });
        if (!conversation || !conversation.isGroup) {
            res.status(404).json({
                message: "Group conversation not found",
            });
            return;
        }
        // 2. Verify current user belongs to group and has admin privileges
        const requester = conversation.participants.find((p) => p.userId === currentUserId);
        const isRequesterAdmin = requester?.isAdmin || conversation.creatorId === currentUserId;
        if (!requester || !isRequesterAdmin) {
            res.status(403).json({
                message: "Only group admins can manage administrator privileges",
            });
            return;
        }
        // 3. Verify target user belongs to group
        const target = conversation.participants.find((p) => p.userId === targetUserId);
        if (!target) {
            res.status(404).json({
                message: "Target user is not a member of this group",
            });
            return;
        }
        // 4. Creator protection: cannot demote creator
        if (!isAdmin && conversation.creatorId === targetUserId) {
            res.status(400).json({
                message: "Cannot remove admin privileges from the group creator",
            });
            return;
        }
        // 5. Ensure at least one admin remains in group
        if (!isAdmin) {
            const currentAdminCount = conversation.participants.filter((p) => p.isAdmin || p.userId === conversation.creatorId).length;
            if (currentAdminCount <= 1 && target.isAdmin) {
                res.status(400).json({
                    message: "A group must have at least one administrator",
                });
                return;
            }
        }
        // Update target participant
        const updated = await prisma.conversationParticipant.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: targetUserId,
                },
            },
            data: {
                isAdmin,
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
        });
        res.json({
            message: isAdmin ? "Admin privileges granted" : "Admin privileges removed",
            participant: updated,
        });
    }
    catch (error) {
        console.error("Update group admin error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
//# sourceMappingURL=conversation.controller.js.map