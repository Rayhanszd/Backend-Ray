import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createUser, findUserByMobile } from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

// Register 

export const register = (req, res) => {
  const data = req.body;
  if (!data.fullName || !data.mobile || !data.password) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields",
      },
    });
  }

  findUserByMobile(data.mobile, async (err, user) => {
    if (user) {
      return res.status(400).json({
        error: { code: "USER_EXISTS", message: "User already registered" },
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    createUser(data, (err, newUser) => {
      if (err) return res.status(500).json({ error: err.message });

      const token = jwt.sign(
        { id: newUser.id, mobile: newUser.mobile },
        process.env.ACCESS_SECRET_KEY,
        { expiresIn: "1h" }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          gender: newUser.gender,
          dob: newUser.dob,
          mobile: newUser.mobile,
        },
      });
    });
  });
};

// Login

export const login = (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing mobile or password",
      },
    });
  }

  findUserByMobile(mobile, async (err, user) => {
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
      { id: user.id, mobile: user.mobile },
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
        mobile: user.username,
      },
    });
  });
};

// Logout

export const logoutUser = (req, res) => {
  try {
    // Kalau nanti kamu pakai token blacklist, bisa disimpan di DB di sini
    // Misalnya: insert token ke tabel revoked_tokens
    return res.status(204).send(); // Sesuai Swagger: No Content
  } catch (error) {
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        message: "Logout failed.",
        details: error.message
      }
    });
  }
};

export const logout = (req, res) => {
  res.status(204).send();
};
