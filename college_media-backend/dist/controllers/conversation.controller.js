import prisma from "../lib/prisma.js";
import { getIO } from "../socket/socket.js";
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
export const deleteMessage = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const messageId = req.params.messageId;
        const conversationIdParam = req.params.conversationId;
        const message = await prisma.message.findUnique({
            where: {
                id: messageId,
            },
            include: {
                conversation: {
                    include: {
                        participants: true,
                    },
                },
            },
        });
        if (!message) {
            res.status(404).json({
                message: "Message not found",
            });
            return;
        }
        if (conversationIdParam && message.conversationId !== conversationIdParam) {
            res.status(400).json({
                message: "Message does not belong to specified conversation",
            });
            return;
        }
        // Authorization: User must be message sender or group admin/creator
        const isSender = message.senderId === currentUserId;
        const isGroupAdmin = message.conversation.isGroup &&
            (message.conversation.creatorId === currentUserId ||
                message.conversation.participants.some((p) => p.userId === currentUserId && p.isAdmin));
        if (!isSender && !isGroupAdmin) {
            res.status(403).json({
                message: "Forbidden: You are not authorized to delete this message",
            });
            return;
        }
        // Delete message from database
        await prisma.message.delete({
            where: {
                id: messageId,
            },
        });
        // Find the latest message remaining in this conversation
        const lastMessage = await prisma.message.findFirst({
            where: {
                conversationId: message.conversationId,
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
        // Update conversation updatedAt
        await prisma.conversation.update({
            where: {
                id: message.conversationId,
            },
            data: {
                updatedAt: lastMessage ? lastMessage.createdAt : new Date(),
            },
        });
        // Emit socket event to notify conversation room and participants
        try {
            const io = getIO();
            const payload = {
                messageId,
                conversationId: message.conversationId,
                lastMessage: lastMessage || null,
            };
            io.to(message.conversationId).emit("messageDeleted", payload);
            for (const p of message.conversation.participants) {
                io.to(p.userId).emit("messageDeleted", payload);
            }
        }
        catch {
            // socket might not be initialized in test environment
        }
        res.json({
            message: "Message deleted successfully",
            messageId,
            conversationId: message.conversationId,
            lastMessage: lastMessage || null,
        });
    }
    catch (error) {
        console.error("Delete message error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const addGroupMembers = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const conversationId = req.params.conversationId;
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            res.status(400).json({
                message: "userIds array is required and must contain at least one user ID",
            });
            return;
        }
        // 1. Verify conversation exists and is a group
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true },
        });
        if (!conversation || !conversation.isGroup) {
            res.status(404).json({
                message: "Group conversation not found",
            });
            return;
        }
        // 2. Authorization check: requester must be group admin or creator
        const requester = conversation.participants.find((p) => p.userId === currentUserId && !p.isDeleted);
        const isRequesterAdmin = requester?.isAdmin || conversation.creatorId === currentUserId;
        if (!requester || !isRequesterAdmin) {
            res.status(403).json({
                message: "Forbidden: Only group administrators can add members",
            });
            return;
        }
        // 3. Verify users exist
        const uniqueUserIds = Array.from(new Set(userIds.filter((id) => Boolean(id) && typeof id === "string")));
        const existingUsers = await prisma.user.findMany({
            where: {
                id: { in: uniqueUserIds },
            },
            select: { id: true, name: true, avatarUrl: true },
        });
        if (existingUsers.length === 0) {
            res.status(400).json({
                message: "No valid users found to add",
            });
            return;
        }
        // 4. Upsert/add participants
        for (const user of existingUsers) {
            const existingParticipant = conversation.participants.find((p) => p.userId === user.id);
            if (existingParticipant) {
                if (existingParticipant.isDeleted) {
                    await prisma.conversationParticipant.update({
                        where: {
                            conversationId_userId: {
                                conversationId,
                                userId: user.id,
                            },
                        },
                        data: {
                            isDeleted: false,
                        },
                    });
                }
            }
            else {
                await prisma.conversationParticipant.create({
                    data: {
                        conversationId,
                        userId: user.id,
                        isAdmin: false,
                        isDeleted: false,
                    },
                });
            }
        }
        // Fetch refreshed conversation
        const updatedConversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    where: { isDeleted: false },
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
        // Notify via socket
        try {
            const io = getIO();
            io.to(conversationId).emit("groupMembersUpdated", {
                conversationId,
                addedUserIds: existingUsers.map((u) => u.id),
            });
            for (const user of existingUsers) {
                io.to(user.id).emit("groupInvite", updatedConversation);
            }
        }
        catch {
            // socket safe
        }
        res.json(updatedConversation);
    }
    catch (error) {
        console.error("Add group members error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const removeGroupMember = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const conversationId = req.params.conversationId;
        const targetUserId = req.params.targetUserId;
        // 1. Verify conversation exists and is a group
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true },
        });
        if (!conversation || !conversation.isGroup) {
            res.status(404).json({
                message: "Group conversation not found",
            });
            return;
        }
        // 2. Authorization check: requester must be group admin or creator
        const requester = conversation.participants.find((p) => p.userId === currentUserId && !p.isDeleted);
        const isRequesterAdmin = requester?.isAdmin || conversation.creatorId === currentUserId;
        if (!requester || !isRequesterAdmin) {
            res.status(403).json({
                message: "Forbidden: Only group administrators can remove members",
            });
            return;
        }
        // 3. Creator protection: cannot remove the group creator
        if (targetUserId === conversation.creatorId) {
            res.status(400).json({
                message: "Cannot remove the group creator from the group",
            });
            return;
        }
        // 4. Target user must be an active participant
        const targetParticipant = conversation.participants.find((p) => p.userId === targetUserId && !p.isDeleted);
        if (!targetParticipant) {
            res.status(404).json({
                message: "Member not found in this group",
            });
            return;
        }
        // 5. Admin protection: normal admin cannot remove another admin unless they are creator
        if (targetParticipant.isAdmin && conversation.creatorId !== currentUserId) {
            res.status(403).json({
                message: "Only the group creator can remove other administrators",
            });
            return;
        }
        // 6. Delete the participant
        await prisma.conversationParticipant.delete({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: targetUserId,
                },
            },
        });
        // Notify via socket
        try {
            const io = getIO();
            io.to(conversationId).emit("groupMemberRemoved", {
                conversationId,
                removedUserId: targetUserId,
            });
            io.to(targetUserId).emit("removedFromGroup", {
                conversationId,
            });
        }
        catch {
            // socket safe
        }
        res.json({
            message: "Member removed from group successfully",
            removedUserId: targetUserId,
            conversationId,
        });
    }
    catch (error) {
        console.error("Remove group member error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
//# sourceMappingURL=conversation.controller.js.map