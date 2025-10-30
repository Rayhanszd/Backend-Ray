import db from "../config/db.js";

// 🎥 1️⃣ GET /therapy/videos — daftar video
export const getVideoSections = (req, res) => {
  const sql = `
    SELECT 
      id, 
      title_en AS title, 
      duration AS durationMinutes, 
      image_url AS thumbnailUrl
    FROM ms_therapy_material
    WHERE type = 'video'
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching videos:", err);
      return res.status(500).json({ error: "Failed to fetch videos" });
    }

    const formatted = results.map(v => ({
      id: v.id,
      title: v.title,
      durationMinutes: v.durationMinutes,
      thumbnailUrl: v.thumbnailUrl
    }));

    res.status(200).json(formatted);
  });
};

// 🎞️ 2️⃣ GET /therapy/videos/:sectionId — detail video
export const getVideoContent = (req, res) => {
  const { sectionId } = req.params;

  const sql = `
    SELECT 
      id, 
      title_en AS title, 
      duration AS durationMinutes, 
      image_url AS thumbnailUrl, 
      video_url AS videoUrl, 
      description_en AS description
    FROM ms_therapy_material
    WHERE id = ? AND type = 'video'
  `;

  db.query(sql, [sectionId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching video content:", err);
      return res.status(500).json({ error: "Failed to fetch video content" });
    }

    if (results.length === 0)
      return res.status(404).json({ error: "Video not found" });

    const v = results[0];
    res.status(200).json({
      id: v.id,
      title: v.title,
      durationMinutes: v.durationMinutes,
      thumbnailUrl: v.thumbnailUrl,
      description: v.description,
      videoUrl: v.videoUrl
    });
  });
};

// 📘 GET /therapy/ebooks — daftar ebook
export const getEbooks = (req, res) => {
  const sql = `
    SELECT 
      id,
      title_en AS title,
      created_by AS author,
      image_url AS coverUrl,
      article_url AS pdfUrl
    FROM ms_therapy_material
    WHERE article_url IS NOT NULL
      AND article_url LIKE '%.pdf%'
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching ebooks:", err);
      return res.status(500).json({ error: "Failed to fetch ebooks" });
    }

    const formatted = results.map((e) => ({
      id: `e_${String(e.id).padStart(2, "0")}`, // ubah id jadi e_01, e_02, dst.
      title: e.title,
      author: e.author || "H. Wardana, M.Psi.", // default sesuai Swagger
      coverUrl: e.coverUrl,
    }));

    res.status(200).json(formatted);
  });
};



// 📕 GET /therapy/ebooks/:ebookId — detail ebook
export const getEbookContent = (req, res) => {
  const { ebookId } = req.params;

  // Ambil hanya angka dari id seperti e_01 → 1
  const numericId = ebookId.replace("e_", "");

  const sql = `
    SELECT 
      id,
      title_en AS title,
      description_en AS description,
      created_by AS author,
      image_url AS coverUrl,
      article_url AS pdfUrl
    FROM ms_therapy_material
    WHERE id = ?
      AND article_url IS NOT NULL
      AND article_url LIKE '%.pdf%'
  `;

  db.query(sql, [numericId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching ebook content:", err);
      return res.status(500).json({ error: "Failed to fetch ebook content" });
    }

    if (results.length === 0)
      return res.status(404).json({ error: "Ebook not found" });

    const e = results[0];
    res.status(200).json({
      id: `e_${String(e.id).padStart(2, "0")}`,
      title: e.title,
      author: e.author || "H. Wardana, M.Psi.",
      coverUrl: e.coverUrl,
      description: e.description || "Exercises and worksheets for CBT practice.",
      pdfUrl: e.pdfUrl,
    });
  });
};



// 💬 5️⃣ GET /therapy/chat/history — riwayat chat
export const getChatHistory = (req, res) => {
  const { userId, page = 1, limit = 50 } = req.query;

  if (!userId)
    return res.status(400).json({ error: "Missing userId" });

  const sql = `
    SELECT 
      id, 
      sufferer_id, 
      summary AS message, 
      created_at
    FROM tr_therapy_logs
    WHERE sufferer_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `;

  db.query(sql, [userId, Number(limit)], (err, results) => {
    if (err) {
      console.error("❌ Error fetching chat history:", err);
      return res.status(500).json({ error: "Failed to fetch chat history" });
    }

    const formatted = results.map(r => ({
      id: r.id,
      sender: "user",
      message: r.message,
      messageType: "text",
      sentAt: r.created_at
    }));

    res.status(200).json({ page: Number(page), limit: Number(limit), items: formatted });
  });
};

// 🧠 6️⃣ POST /therapy/chat/send — kirim chat
export const sendChatMessage = (req, res) => {
  const { sufferer_id, message, messageType = "text" } = req.body;

  if (!sufferer_id || !message)
    return res.status(400).json({ error: "Missing sufferer_id or message" });

  const sql = `
    INSERT INTO tr_therapy_logs (therapy_id, sufferer_id, summary, created_at)
    VALUES (NULL, ?, ?, NOW())
  `;

  db.query(sql, [sufferer_id, message], (err, result) => {
    if (err) {
      console.error("❌ Error inserting chat:", err);
      return res.status(500).json({ error: "Failed to save chat" });
    }

    const userMsg = {
      id: "c_" + result.insertId,
      sender: "user",
      message,
      messageType,
      sentAt: new Date().toISOString()
    };

    const aiResponse = {
      id: "c_" + (result.insertId + 1),
      sender: "ai",
      message: "Try the 5-4-3-2-1 technique focusing on your senses.",
      messageType: "text",
      sentAt: new Date(Date.now() + 1000).toISOString()
    };

    res.status(200).json({ message: userMsg, aiResponse });
  });
};
