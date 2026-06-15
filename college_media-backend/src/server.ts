import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./lib/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import followRoutes from "./routes/follow.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import communityRoutes from "./routes/community.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import http from "http";
import { initSocket } from "./socket/socket.js";
import messageRoutes from "./routes/message.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import likeRoutes from "./routes/like.routes.js";
// import groupRoutes from "./routes/group.routes.js";
dotenv.config();

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("CollegeMedia API Running");
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/likes", likeRoutes);
// app.use("/api/groups", groupRoutes);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
