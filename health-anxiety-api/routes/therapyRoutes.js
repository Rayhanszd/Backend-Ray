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

router.get("/videos", getVideoSections);
router.get("/videos/:sectionId", getVideoContent);
router.get("/ebooks", getEbooks);
router.get("/ebooks/:ebookId", getEbookContent);
router.get("/chat/history", getChatHistory);
router.post("/chat/send", sendChatMessage);

export default router;
