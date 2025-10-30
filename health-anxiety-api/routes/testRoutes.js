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

export default router;
