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
//# sourceMappingURL=auth.controller.js.map