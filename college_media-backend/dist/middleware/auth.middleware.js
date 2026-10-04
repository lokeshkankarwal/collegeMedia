import jwt from "jsonwebtoken";
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                message: "No token provided",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "Invalid token",
        });
    }
};
export const optionalAuthenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
                req.userId = decoded.userId;
            }
        }
    }
    catch {
        // Ignore invalid token for optional auth
    }
    next();
};
//# sourceMappingURL=auth.middleware.js.map