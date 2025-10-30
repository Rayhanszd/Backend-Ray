import db from "../config/db.js";

export const getUserProfile = (req, res) => {
  const userId = req.user.id; // Assuming you have auth middleware that sets req.user

  const sql =
    "SELECT id, name, gender, username, email, role_id, created_at FROM ms_users WHERE id = ?";

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: { code: "SERVER_ERROR", message: "Failed to fetch user data" },
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: { code: "USER_NOT_FOUND", message: "User not found" },
      });
    }

    const user = results[0];
    res.status(200).json({
      id: user.id,
      fullName: user.name,
      username: user.username,
      email: user.email,
      gender: user.gender,
      roleId: user.role_id,
      createdAt: user.created_at,
    });
  });
};

export const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const {
    fullName, // map ke kolom nama
    gender,
    username, // map ke kolom username
    email,
    password,
  } = req.body;

  try {
    // 1) Cek apakah user ada
    const [rows] = await db
      .promise()
      .query("SELECT * FROM ms_users WHERE id = ? LIMIT 1", [userId]);
    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: "User not found" } });
    }

    // 2) Bangun query update dinamis (hanya field yang dikirim)
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
    if (username !== undefined) {
      fields.push("username = ?");
      values.push(username);
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

    // Jika tidak ada field yang diupdate
    if (fields.length === 0) {
      const [fresh] = await db
        .promise()
        .query(
          "SELECT id, name, gender, username, email FROM ms_users WHERE id = ? LIMIT 1",
          [userId]
        );
      return res.status(200).json(mapUserRowToResponse(fresh[0]));
    }

    // Tambahkan updated_at
    fields.push("updated_at = NOW()");

    // Jalankan query update
    const sql = `UPDATE ms_users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(userId);
    await db.promise().query(sql, values);

    // Ambil data terbaru
    const [updatedRows] = await db
      .promise()
      .query(
        "SELECT id, name, gender, username, email FROM ms_users WHERE id = ? LIMIT 1",
        [userId]
      );

    const userResp = mapUserRowToResponse(updatedRows[0]);
    return res.status(200).json(userResp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        code: "DB_ERROR",
        message: "Database error",
        details: err.message,
      },
    });
  }
};

// Helper mapper
const mapUserRowToResponse = (row) => ({
  id: row.id.toString(),
  fullName: row.name,
  gender: row.gender,
  username: row.username,
  email: row.email,
  photoUrl: `https://cdn.example.com/profiles/${row.id}.jpg`,
});

// UPLOAD profile photo
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
