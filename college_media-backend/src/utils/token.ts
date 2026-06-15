import jwt from "jsonwebtoken";

export const generateAccessToken = (
  userId: string
): string => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_ACCESS_SECRET! as string,
    {
      expiresIn:
        (process.env.JWT_ACCESS_EXPIRES as any) || "7d",
    }
  );
};

export const generateRefreshToken = (
  userId: string
): string => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_REFRESH_SECRET! as string,
    {
      expiresIn:
        (process.env.JWT_REFRESH_EXPIRES as any) || "7d",
    }
  );
};