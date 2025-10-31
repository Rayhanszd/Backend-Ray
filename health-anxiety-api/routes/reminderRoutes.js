import express from "express";
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  markTaken
} from "../controllers/reminderController.js";

const router = express.Router();

router.get("/:userId", getReminders);
router.post("/:userId", createReminder);
router.put("/:reminderId", updateReminder);
router.delete("/:reminderId", deleteReminder);
router.post("/:reminderId/taken", markTaken);

// ========= FRONTEND ==========

router.get("/FE/:userId", getReminders);
router.post("/FE/:userId", createReminder);
router.put("/FE/:reminderId", updateReminder);
router.delete("/FE/:reminderId", deleteReminder);
router.post("/FE/:reminderId/taken", markTaken);

export default router;
