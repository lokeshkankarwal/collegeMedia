import { Server } from "socket.io";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import type { AuthenticatedSocket } from "../types/socket.js";

// Basic interface to support type safety for your verified payload
interface JwtPayload {
  userId: string;
}

let io: Server;

// Tracks active database userIds mapped to their primary socket channel string
const onlineUsers = new Map<string, string>();

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  /*
  =========================================
  JWT AUTH MIDDLEWARE
  =========================================
  */
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log("Socket auth token:", token); // Debug log to check token presence
      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!,
      ) as JwtPayload;

      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  /*
  =========================================
  CONNECTION
  =========================================
  */
  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    if (!userId) return; // Guard clause if userId is mysteriously missing

    console.log(`Connected: ${userId}`);

    /*
    =========================================
    AUTO JOIN USER ROOM
    =========================================
    */
    socket.join(userId);
    onlineUsers.set(userId, socket.id);

    // Broadcast updated list of online user IDs to everyone
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    /*
    =========================================
    SEND MESSAGE
    =========================================
    */
    socket.on("sendMessage", async (data) => {
      try {
        const { conversationId, content, attachmentUrl, attachmentType } = data;

        const message = await prisma.message.create({
          data: {
            senderId: userId,
            conversationId,
            content,
            attachmentUrl,
            attachmentType,
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

        console.log("ROOM:", conversationId);

        console.log("MESSAGE:", content);

        io.to(conversationId).emit("receiveMessage", message);
      } catch (error) {
        console.error("sendMessage error:", error);
      }
    });

    /*
    =========================================
    TYPING INDICATION
    =========================================
    */
    socket.on("typing", (data) => {
      socket.to(data.conversationId).emit("userTyping");
    });

    socket.on("stopTyping", (data) => {
      const { conversationId, receiverId } = data;
      io.to(receiverId).emit("userStoppedTyping", {
        senderId: userId,
        conversationId,
      });
    });

    /*
    =========================================
    READ RECEIPTS
    =========================================
    */
    socket.on("markAsRead", async (messageId: string) => {
      try {
        const message = await prisma.message.update({
          where: {
            id: messageId,
          },
          data: {
            isRead: true,
          },
        });

        // Inform the original author that their message has been seen
        io.to(message.senderId).emit("messageRead", {
          messageId,
          conversationId: message.conversationId,
        });
      } catch (error) {
        console.error("Error processing markAsRead:", error);
      }
    });

    /*
    =========================================
    DISCONNECT
    =========================================
    */
    socket.on("disconnect", () => {
      console.log(`Disconnected: ${userId}`);
      onlineUsers.delete(userId);

      // Update everyone's online status indicator array
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
    let currentConversation: string | null = null;

    socket.on("joinConversation", (conversationId: string) => {
      if (currentConversation && currentConversation !== conversationId) {
        socket.leave(currentConversation);

        console.log(`${userId} left ${currentConversation}`);
      }

      currentConversation = conversationId;

      socket.join(conversationId);

      console.log(`${userId} joined ${conversationId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized");
  }
  return io;
};
