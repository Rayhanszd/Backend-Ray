import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createUser, findUserByUsername } from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

// Register
export const register = (req, res) => {
  const data = req.body;
  if (
    !data.fullName ||
    !data.username ||
    !data.password ||
    !data.email ||
    !data.gender
  ) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields",
      },
    });
  }

  // Check if user exists by username
  findUserByUsername(data.username, async (err, user) => {
    if (user) {
      return res.status(400).json({
        error: { code: "USER_EXISTS", message: "Username already registered" },
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    createUser(data, (err, newUser) => {
      if (err) {
        console.error("Error creating user:", err);
        return res.status(500).json({
          error: { code: "SERVER_ERROR", message: "Failed to create user" },
        });
      }
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          username: newUser.username,
          email: newUser.email,
          gender: newUser.gender,
        },
      });
    });
  });
};

// Login
export const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing username or password",
      },
    });
  }

  findUserByUsername(username, async (err, user) => {
    if (!user) {
      return res.status(400).json({
        error: { code: "INVALID_CREDENTIALS", message: "User not found" },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        error: { code: "INVALID_CREDENTIALS", message: "Incorrect password" },
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.ACCESS_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        fullName: user.name,
        gender: user.gender,
        dob: user.dob || null,
        username: user.username,
      },
    });
  });
};

// Logout
export const logoutUser = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};
