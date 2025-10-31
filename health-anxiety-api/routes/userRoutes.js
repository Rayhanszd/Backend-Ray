import express from "express";
import { getUserProfile, updateUserProfile, uploadProfilePhoto } from "../controllers/userController.js";
import fs from "fs";
import path from "path";
import multer from "multer";


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

router.get("/profile/:userId", getUserProfile);
router.put("/profile/:userId", updateUserProfile);
router.post("/profile/photo/:userId", upload.single("file"), uploadProfilePhoto);

// ========= FRONTEND ==========

router.get("/FE/profile/:userId", getUserProfile);
router.put("/FE/profile/:userId", updateUserProfile);
router.post("/FE/profile/photo/:userId", upload.single("file"), uploadProfilePhoto);

export default router;
