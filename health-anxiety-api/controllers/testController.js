// controllers/testController.js
import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// ======================
// GET /test/questions
// ======================
export const getQuestions = (req, res) => {
  const query = `
    SELECT q.id AS questionId, q.type, q.sequence,
           o.option_a, o.option_b, o.option_c, o.option_d
    FROM ms_screening_questions q
    LEFT JOIN ms_screening_question_options o
    ON q.id = o.question_id
    ORDER BY q.sequence ASC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching questions:", err);
      return res.status(500).json({ error: "Failed to fetch questions" });
    }

    const questions = results.map((row) => ({
      id: row.questionId,
      text: `Question ${row.sequence}`, // nanti bisa ganti ke kolom text kalau ada
      options: [
        { value: "option_a", label: row.option_a, score: 0 },
        { value: "option_b", label: row.option_b, score: 1 },
        { value: "option_c", label: row.option_c, score: 2 },
        { value: "option_d", label: row.option_d, score: 3 },
      ],
    }));

    res.status(200).json(questions);
  });
};

// ======================
// POST /test/submit
// ======================
export const submitTest = (req, res) => {
  const { testType, answers } = req.body;

  // ✅ validasi sederhana
  if (!testType || !answers || !Array.isArray(answers)) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields"
      }
    });
  }

  // Hitung total skor
  let totalScore = 0;
  answers.forEach((ans) => {
    if (ans.selectedOption === "often") totalScore += 3;
    else if (ans.selectedOption === "sometimes") totalScore += 1;
  });

  // Klasifikasi berdasarkan skor
  let severity = "Mild";
  if (totalScore >= 15) severity = "Severe";
  else if (totalScore >= 10) severity = "Moderate";

  const testId = `t_${uuidv4().split("-")[0]}`;
  const takenAt = new Date().toISOString();

  // Simpan ke tr_screening_logs (optional)
  const query = `
    INSERT INTO tr_screening_logs (sufferer_id, score, classification, created_at)
    VALUES (?, ?, ?, NOW())
  `;
  db.query(query, [1, totalScore, severity], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(201).json({
      testId,
      testType,
      totalScore,
      severity,
      takenAt,
      recommendations: ["Practice deep breathing daily."]
    });
  });
};  

// ======================
// GET /test/results/:testId
// ======================
export const getTestResult = (req, res) => {
  const { testId } = req.params;

  // Biar bisa handle "t_1" atau "1"
  const numericId = testId.toString().startsWith("t_")
    ? testId.replace("t_", "")
    : testId;

  db.query(
    `SELECT * FROM tr_screening_logs WHERE id = ?`,
    [numericId],
    (err, results) => {
      if (err) {
        console.error("❌ Error fetching test result:", err);
        return res.status(500).json({
          error: {
            code: "DB_ERROR",
            message: "Failed to fetch test result"
          }
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          error: {
            code: "NOT_FOUND",
            message: "Test result not found"
          }
        });
      }

      const data = results[0];

      // Tentukan testType berdasarkan id (contoh aja, karena di DB belum ada kolomnya)
      const testType = data.id % 2 === 1 ? "pre" : "post";

      res.status(200).json({
        testId: `t_${data.id}`,                     // format sesuai swagger
        testType: testType,                         // tambahkan field ini
        totalScore: data.score,
        severity: data.classification,
        takenAt: data.created_at,
        recommendations: [
          "Practice deep breathing daily.",
          "Follow module 2 videos this week."
        ]
      });
    }
  );
};

// ======================
// GET /test/history
// ======================
export const getTestHistory = (req, res) => {
  const { page = 1, limit = 10, testType = "all", sufferer_id } = req.query;

  if (!sufferer_id) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Missing sufferer_id" },
    });
  }

  const offset = (page - 1) * limit;

  const sql = `
    SELECT id, score, classification, created_at
    FROM tr_screening_logs
    WHERE sufferer_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [sufferer_id, parseInt(limit), parseInt(offset)], (err, results) => {
    if (err) {
      console.error("❌ Error fetching test history:", err.sqlMessage || err.message);
      return res.status(500).json({
        error: { code: "SERVER_ERROR", message: err.sqlMessage || "Failed to fetch test history" },
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "No test history found" },
      });
    }

    const history = results.map((item) => ({
      testId: item.id,
      totalScore: item.score,
      severity: item.classification,
      takenAt: item.created_at,
    }));

    res.status(200).json({
      suffererId: sufferer_id,
      page: parseInt(page),
      limit: parseInt(limit),
      total: results.length,
      history,
    });
  });
};



