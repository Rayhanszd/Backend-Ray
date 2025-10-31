import express from "express";
import { 
  getVideoSections,
  getVideoContent,
  getEbooks,
  getEbookContent,
  getChatHistory,
  sendChatMessage
} from "../controllers/therapyController.js";

const router = express.Router();

//========= GLOBAL ==========

router.get("/videos", getVideoSections);
router.get("/videos/:sectionId", getVideoContent);
router.get("/ebooks", getEbooks);
router.get("/ebooks/:ebookId", getEbookContent);
router.get("/chat/history", getChatHistory);
router.post("/chat/send", sendChatMessage);

// ========= FRONTEND ==========

router.get("/FE/videos", getVideoSections);
router.get("/FE/videos/:sectionId", getVideoContent);
router.get("/FE/ebooks", getEbooks);
router.get("/FE/ebooks/:ebookId", getEbookContent);
router.get("/FE/chat/history", getChatHistory);
router.post("/FE/chat/send", sendChatMessage);

export default router;
