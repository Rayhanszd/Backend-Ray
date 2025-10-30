import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "No token provided" },
    });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
    req.user = decoded; // decoded should contain { id, username, ... }
    next();
  } catch (error) {
    return res.status(401).json({
      error: { code: "INVALID_TOKEN", message: "Invalid or expired token" },
    });
  }
};
