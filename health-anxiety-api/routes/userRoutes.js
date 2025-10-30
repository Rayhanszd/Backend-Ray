import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfilePhoto,
} from "../controllers/userController.js";
import fs from "fs";
import path from "path";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Konfigurasi upload foto
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Get user profile
router.get("/profile", authMiddleware, getUserProfile);

// Update user profile
router.put("/profile", authMiddleware, updateUserProfile);

// GET /user/profile/:userId
router.get("/profile/:userId", getUserProfile);

// PUT /user/profile/:userId
router.put("/profile/:userId", updateUserProfile);

// POST /user/profile/photo/:userId
router.post(
  "/profile/photo/:userId",
  upload.single("file"),
  uploadProfilePhoto
);

export default router;
