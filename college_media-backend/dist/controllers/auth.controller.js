import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken, } from "../utils/token.js";
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({
                message: "All fields are required",
            });
            return;
        }
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (existingUser) {
            res.status(409).json({
                message: "User already exists",
            });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({
            message: "User created successfully",
            user,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            res.status(401).json({
                message: "Invalid credentials",
            });
            return;
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({
                message: "Invalid credentials",
            });
            return;
        }
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
            },
        });
        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({
                message: "Refresh token required",
            });
            return;
        }
        const storedToken = await prisma.refreshToken.findUnique({
            where: {
                token: refreshToken,
            },
        });
        if (!storedToken) {
            res.status(401).json({
                message: "Invalid refresh token",
            });
            return;
        }
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const accessToken = generateAccessToken(payload.userId);
        res.json({
            accessToken,
        });
    }
    catch {
        res.status(401).json({
            message: "Invalid refresh token",
        });
    }
};
export const logout = async (req, res) => {
    const { refreshToken } = req.body;
    await prisma.refreshToken.deleteMany({
        where: {
            token: refreshToken,
        },
    });
    res.json({
        message: "Logged out",
    });
};
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/email.service.js";
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== "string" || !email.includes("@")) {
            res.status(400).json({
                message: "Please provide a valid email address",
            });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });
        if (user) {
            // Invalidate existing reset tokens for this user
            await prisma.passwordResetToken.deleteMany({
                where: {
                    userId: user.id,
                },
            });
            const rawToken = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            await prisma.passwordResetToken.create({
                data: {
                    userId: user.id,
                    tokenHash,
                    expiresAt,
                },
            });
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            // HashRouter is used on frontend, so format is /#/reset-password/:token
            const resetLink = `${frontendUrl.replace(/\/$/, "")}/#/reset-password/${rawToken}`;
            await sendPasswordResetEmail({
                to: user.email,
                resetLink,
            });
        }
        // Always respond with generic message to prevent email enumeration
        res.status(200).json({
            message: "If an account exists with this email, a password reset link has been sent.",
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || typeof token !== "string") {
            res.status(400).json({
                message: "Reset token is required",
            });
            return;
        }
        if (!password || typeof password !== "string" || password.length < 6) {
            res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
            return;
        }
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const resetRecord = await prisma.passwordResetToken.findFirst({
            where: {
                tokenHash,
                used: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (!resetRecord) {
            res.status(400).json({
                message: "Invalid or expired password reset link. Please request a new one.",
            });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // Update password
        await prisma.user.update({
            where: {
                id: resetRecord.userId,
            },
            data: {
                password: hashedPassword,
            },
        });
        // Mark token as used
        await prisma.passwordResetToken.update({
            where: {
                id: resetRecord.id,
            },
            data: {
                used: true,
            },
        });
        // Invalidate refresh tokens for security
        await prisma.refreshToken.deleteMany({
            where: {
                userId: resetRecord.userId,
            },
        });
        res.status(200).json({
            message: "Password reset successful. Please sign in with your new password.",
        });
    }
    catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
//# sourceMappingURL=auth.controller.js.map