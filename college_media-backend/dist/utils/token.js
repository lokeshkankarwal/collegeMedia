import jwt from "jsonwebtoken";
export const generateAccessToken = (userId) => {
    return jwt.sign({
        userId,
    }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES || "7d",
    });
};
export const generateRefreshToken = (userId) => {
    return jwt.sign({
        userId,
    }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
    });
};
//# sourceMappingURL=token.js.map