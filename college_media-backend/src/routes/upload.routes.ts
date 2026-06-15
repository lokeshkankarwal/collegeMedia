import { Router }
from "express";

import upload
from "../middleware/upload.middleware.js";

import {
  uploadImage,
} from "../controllers/upload.controller.js";

const router = Router();

router.post(
  "/",
  upload.single("image"),
  uploadImage
);

export default router;