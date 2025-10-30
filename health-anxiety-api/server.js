import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import therapyRoutes from "./routes/therapyRoutes.js";



import "./config/db.js";

dotenv.config();
const app = express();

// ✅ agar body JSON bisa dibaca
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors());
app.use(bodyParser.json());
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/test", testRoutes);
app.use("/reminders", reminderRoutes);
app.use("/therapy", therapyRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
