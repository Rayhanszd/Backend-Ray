import db from "../config/db.js";
import path from "path";
import bcrypt from "bcryptjs";


// ============= GLOBAL ROUTES ============= //


// GET /user/profile/:userId

export const getUserProfile = (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT id, name AS fullName, gender, username AS mobile, email, '' AS photoUrl FROM ms_users WHERE id = ?";

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });
    res.status(200).json(results[0]);
  });
};

// PUT /user/profile/:userId

export const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const {
    fullName,     // map ke kolom nama
    gender,
    mobile,       // map ke kolom username
    email,
    password
  } = req.body;

  try {
    const [rows] = await db.promise().query("SELECT * FROM ms_users WHERE id = ? LIMIT 1", [userId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    }
    const fields = [];
    const values = [];

    if (fullName !== undefined) {
      fields.push("name = ?");
      values.push(fullName);
    }
    if (gender !== undefined) {
      fields.push("gender = ?");
      values.push(gender);
    }
    if (mobile !== undefined) {
      fields.push("username = ?");
      values.push(mobile);
    }
    if (email !== undefined) {
      fields.push("email = ?");
      values.push(email);
    }
    if (password !== undefined) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push("password = ?");
      values.push(hashed);
    }

    if (fields.length === 0) {
      const [fresh] = await db.promise().query(
        "SELECT id, name, gender, username, email FROM ms_users WHERE id = ? LIMIT 1",
        [userId]
      );
      return res.status(200).json(mapUserRowToResponse(fresh[0]));
    }

    fields.push("updated_at = NOW()");

    const sql = `UPDATE ms_users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(userId);
    await db.promise().query(sql, values);

    const [updatedRows] = await db.promise().query(
      "SELECT id, name, gender, username, email FROM ms_users WHERE id = ? LIMIT 1",
      [userId]
    );

    const userResp = mapUserRowToResponse(updatedRows[0]);
    return res.status(200).json(userResp);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: { code: "DB_ERROR", message: "Database error", details: err.message }
    });
  }
};

const mapUserRowToResponse = (row) => ({
  id: row.id.toString(),
  fullName: row.name,
  gender: row.gender,
  mobile: row.username,
  email: row.email,
  photoUrl: `https://cdn.example.com/profiles/${row.id}.jpg`
});

// POST /user/profile/photo/:userId

export const uploadProfilePhoto = (req, res) => {
  const { userId } = req.params;
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const photoUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  const sql = "UPDATE ms_users SET photo = ? WHERE id = ?";
  db.query(sql, [photoUrl, userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ photoUrl });
  });
};


// ============= FRONTEND ROUTES ============= //


// GET /FE/user/profile/:userId

export const FEGetUserProfile = (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT id, name AS fullName, gender, username AS mobile, email, '' AS photoUrl FROM ms_users WHERE id = ?";

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });
    res.status(200).json(results[0]);
  }
);
};

// PUT /FE/user/profile/:userId

export const FEUpdateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const {
    fullName,     // map ke kolom nama
    gender
  } = req.body;

  try {
    const [rows] = await db.promise().query("SELECT * FROM ms_users WHERE id = ? LIMIT 1", [userId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    }
    const fields = [];
    const values = [];  
    if (fullName !== undefined) {
      fields.push("name = ?");
      values.push(fullName);
    }
    if (gender !== undefined) {
      fields.push("gender = ?");
      values.push(gender);
    } 
    if (fields.length === 0) {
      const [fresh] = await db.promise().query(
        "SELECT id, name, gender, username, email FROM ms_users WHERE id = ? LIMIT 1",
        [userId]
      );
      return res.status(200).json(mapUserRowToResponse(fresh[0]));
    } 
    fields.push("updated_at = NOW()");  
    const sql = `UPDATE ms_users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(userId);
    await db.promise().query(sql, values); 
    const [updatedRows] = await db.promise().query(
      "SELECT id, name, gender, username, email FROM ms_users WHERE id = ? LIMIT 1",
      [userId]
    ); 
    const userResp = mapUserRowToResponse(updatedRows[0]);
    return res.status(200).json(userResp); 
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: { code: "DB_ERROR", message: "Database error", details: err.message }
    });
  }
};

// const mapUserRowToResponse = (row) => ({
//   id: row.id.toString(),
//   fullName: row.name,
//   gender: row.gender,
//   mobile: row.username,
//   email: row.email,
//   photoUrl: `https://cdn.example.com/profiles/${row.id}.jpg`
// });

// POST /FE/user/profile/photo/:userId

export const FEUploadProfilePhoto = (req, res) => {
  const { userId } = req.params;
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const photoUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  const sql = "UPDATE ms_users SET photo = ? WHERE id = ?"; 
  db.query(sql, [photoUrl, userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ photoUrl });
  });
};