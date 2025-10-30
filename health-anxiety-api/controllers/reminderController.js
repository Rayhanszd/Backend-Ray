import db from "../config/db.js";

/**
 * ✅ GET /reminders/:userId
 * Get all reminders for a user
 */
export const getReminders = (req, res) => {
  // Default to sufferer_id = 2 if not provided
  const userId = 2;

  const sql = `
    SELECT 
      id,
      sufferer_id,
      medicine_name,
      medicine_detail,
      start_date,
      end_date,
      created_at,
      updated_at
    FROM ms_remind_medicine
    WHERE sufferer_id = ?
    ORDER BY start_date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: { code: "SERVER_ERROR", message: "Failed to fetch reminders" },
      });
    }

    const reminders = results.map((reminder) => ({
      id: reminder.id,
      medicineName: reminder.medicine_name,
      medicineDetails: reminder.medicine_detail,
      startDate: reminder.start_date,
      endDate: reminder.end_date,
      times: [], // Since your DB doesn't have this, return empty array
      frequency: "daily", // Default value
      status: "active", // Default value
      createdAt: reminder.created_at,
      updatedAt: reminder.updated_at,
    }));

    res.status(200).json(reminders);
  });
};

/**
 * ✅ POST /reminders/:userId
 * Create a new reminder
 */
export const createReminder = (req, res) => {
  const userId = 2;
  const { medicineName, medicineDetails, startDate, endDate } = req.body;

  // Validation
  if (!medicineName || !startDate || !endDate) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Missing required fields" },
    });
  }

  const sql = `
    INSERT INTO ms_remind_medicine 
    (sufferer_id, medicine_name, medicine_detail, start_date, end_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `;

  db.query(
    sql,
    [userId, medicineName, medicineDetails, startDate, endDate],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          error: { code: "SERVER_ERROR", message: "Failed to create reminder" },
        });
      }

      res.status(201).json({
        message: "Reminder created successfully",
        id: result.insertId,
        medicineName,
        medicineDetails,
        startDate,
        endDate,
      });
    }
  );
};

/**
 * ✅ PUT /reminders/:reminderId
 * Update a reminder
 */
export const updateReminder = (req, res) => {
  const { reminderId } = req.params;
  const { medicineName, medicineDetails, startDate, endDate } = req.body;

  const sql = `
    UPDATE ms_remind_medicine
    SET 
      medicine_name = ?,
      medicine_detail = ?,
      start_date = ?,
      end_date = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  db.query(
    sql,
    [medicineName, medicineDetails, startDate, endDate, reminderId],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          error: { code: "SERVER_ERROR", message: "Failed to update reminder" },
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Reminder not found" },
        });
      }

      res.status(200).json({
        message: "Reminder updated successfully",
      });
    }
  );
};

/**
 * ✅ DELETE /reminders/:reminderId
 * Delete a reminder
 */
export const deleteReminder = (req, res) => {
  const { reminderId } = req.params;

  const sql = "DELETE FROM ms_remind_medicine WHERE id = ?";

  db.query(sql, [reminderId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: { code: "SERVER_ERROR", message: "Failed to delete reminder" },
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Reminder not found" },
      });
    }

    res.status(200).json({
      message: "Reminder deleted successfully",
    });
  });
};

/**
 * ✅ POST /reminders/:reminderId/taken
 * Mark medicine as taken (optional - if you have this table)
 */
export const markMedicineTaken = (req, res) => {
  const { reminderId } = req.params;
  const { date, time } = req.body;

  if (!date || !time) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Date and time are required",
      },
    });
  }

  const sql = `
    INSERT INTO medicine_taken 
    (reminder_id, taken_date, taken_time, created_at)
    VALUES (?, ?, ?, NOW())
  `;

  db.query(sql, [reminderId, date, time], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: {
          code: "SERVER_ERROR",
          message: "Failed to record medicine intake",
        },
      });
    }

    res.status(201).json({
      message: "Medicine intake recorded successfully",
      id: result.insertId,
    });
  });
};
