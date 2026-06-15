import type {
  Request,
  Response,
} from "express";

import cloudinary
from "../config/cloudinary.js";

export const uploadImage =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          message:
            "No file uploaded",
        });

        return;
      }

      const base64 =
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      const result =
        await cloudinary.uploader.upload(
          base64,
          {
            folder:
              "college-media",
          }
        );

      res.json({
        imageUrl:
          result.secure_url,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Upload failed",
      });
    }
  };