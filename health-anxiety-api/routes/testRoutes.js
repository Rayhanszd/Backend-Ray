import express from "express";
import {
  getQuestions,
  submitTest,
  getTestResult,
  getTestHistory,
} from "../controllers/testController.js";

const router = express.Router();

router.get("/questions", getQuestions);
router.post("/submit", submitTest);
router.get("/results/:testId", getTestResult);
router.get("/history", getTestHistory);

// ========= FRONTEND ==========
router.get("/FE/test/questions", getQuestions);
router.post("/FE/test/submit", submitTest);
router.get("/FE/test/results/:testId", getTestResult);
router.get("/FE/test/history", getTestHistory);

export default router;
