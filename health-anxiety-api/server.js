import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import therapyRoutes from "./routes/therapyRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/reminders", reminderRoutes);
app.use("/user", userRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/test", testRoutes);
app.use("/therapy", therapyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
