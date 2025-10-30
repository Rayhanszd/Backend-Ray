import db from "../config/db.js";

/**
 * ✅ GET /reminders/:userId
 * Ambil semua reminder berdasarkan user (sufferer_id)
 */
export const getReminders = (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate, status = "all" } = req.query;

  let query = `
    SELECT 
      m.id,
      m.medicine_name AS medicineName,
      m.medicine_detail AS medicineDetails,
      m.start_date AS startDate,
      m.end_date AS endDate
    FROM ms_remind_medicine m
    WHERE m.sufferer_id = ?
  `;

  const params = [userId];

  if (startDate) {
    query += " AND m.start_date >= ?";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND m.end_date <= ?";
    params.push(endDate);
  }

  db.query(query, params, (err, medicines) => {
    if (err) {
      console.error("❌ Failed to fetch reminders:", err);
      return res.status(500).json({
        error: { code: "SERVER_ERROR", message: "Failed to fetch reminders" },
      });
    }

    if (medicines.length === 0) return res.status(200).json([]);

    const ids = medicines.map((m) => m.id);
    const sqlTimes = `
      SELECT remind_medicine_id, reminder_time 
      FROM tr_reminder_times 
      WHERE remind_medicine_id IN (?)
    `;

    db.query(sqlTimes, [ids], (err2, times) => {
      if (err2) {
        console.error("❌ Failed to fetch reminder times:", err2);
        return res.status(500).json({
          error: { code: "SERVER_ERROR", message: "Failed to fetch times" },
        });
      }

      const result = medicines.map((m) => {
        const reminderTimes = times
          .filter((t) => t.remind_medicine_id === m.id)
          .map((t) => t.reminder_time);

        return {
          id: `r_${m.id}`,
          medicineName: m.medicineName,
          startDate: m.startDate,
          endDate: m.endDate,
          medicineDetails: m.medicineDetails,
          times: reminderTimes,
          frequency: "daily",
          status: "active",
        };
      });

      res.status(200).json(result);
    });
  });
};

/**
 * ✅ POST /reminders/:userId
 * Tambahkan reminder baru
 */
export const createReminder = (req, res) => {
  const { userId } = req.params;
  const {
    medicineName,
    medicineDetails,
    startDate,
    endDate,
    times,
    frequency = "daily",
  } = req.body;

  if (!medicineName || !startDate || !endDate) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields: medicineName, startDate, endDate.",
      },
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
        console.error("❌ Failed to create reminder:", err);
        return res.status(500).json({
          error: { code: "SERVER_ERROR", message: "Failed to create reminder" },
        });
      }

      const reminderId = result.insertId;

      if (Array.isArray(times) && times.length > 0) {
        const values = times.map((t) => [reminderId, t, new Date(), new Date()]);
        db.query(
          `INSERT INTO tr_reminder_times (remind_medicine_id, reminder_time, created_at, updated_at) VALUES ?`,
          [values],
          (err2) => {
            if (err2) {
              console.error("❌ Failed to insert times:", err2);
              return res.status(500).json({
                error: {
                  code: "SERVER_ERROR",
                  message: "Failed to insert reminder times",
                },
              });
            }

            res.status(201).json({
              id: `r_${reminderId}`,
              medicineName,
              medicineDetails,
              startDate,
              endDate,
              times,
              frequency,
              status: "active",
            });
          }
        );
      } else {
        res.status(201).json({
          id: `r_${reminderId}`,
          medicineName,
          medicineDetails,
          startDate,
          endDate,
          times: [],
          frequency,
          status: "active",
        });
      }
    }
  );
};

/**
 * ✅ PUT /reminders/:reminderId
 * Update reminder
 */
export const updateReminder = (req, res) => {
  const { reminderId } = req.params;
  const {
    medicineName,
    medicineDetails,
    startDate,
    endDate,
    times,
    frequency = "daily",
  } = req.body;

  const sql = `
    UPDATE ms_remind_medicine
    SET medicine_name = ?, medicine_detail = ?, start_date = ?, end_date = ?, updated_at = NOW()
    WHERE id = ?
  `;

  db.query(
    sql,
    [medicineName, medicineDetails, startDate, endDate, reminderId],
    (err) => {
      if (err) {
        console.error("❌ Failed to update reminder:", err);
        return res.status(500).json({
          error: { code: "SERVER_ERROR", message: "Failed to update reminder" },
        });
      }

      db.query(
        `DELETE FROM tr_reminder_times WHERE remind_medicine_id = ?`,
        [reminderId],
        (err2) => {
          if (err2)
            return res
              .status(500)
              .json({ error: { code: "SERVER_ERROR", message: "Failed to reset times" } });

          const values = times.map((t) => [
            reminderId,
            t,
            new Date(),
            new Date(),
          ]);
          db.query(
            `INSERT INTO tr_reminder_times (remind_medicine_id, reminder_time, created_at, updated_at) VALUES ?`,
            [values],
            (err3) => {
              if (err3)
                return res.status(500).json({
                  error: {
                    code: "SERVER_ERROR",
                    message: "Failed to insert new times",
                  },
                });

              res.json({
                id: `r_${reminderId}`,
                medicineName,
                medicineDetails,
                startDate,
                endDate,
                times,
                frequency,
                status: "active",
              });
            }
          );
        }
      );
    }
  );
};

/**
 * ✅ DELETE /reminders/:reminderId
 */
export const deleteReminder = (req, res) => {
  const { reminderId } = req.params;

  db.query(
    `DELETE FROM tr_reminder_times WHERE remind_medicine_id = ?`,
    [reminderId],
    (err) => {
      if (err)
        return res.status(500).json({
          error: {
            code: "SERVER_ERROR",
            message: "Failed to delete reminder times",
          },
        });

      db.query(
        `DELETE FROM ms_remind_medicine WHERE id = ?`,
        [reminderId],
        (err2) => {
          if (err2)
            return res.status(500).json({
              error: {
                code: "SERVER_ERROR",
                message: "Failed to delete reminder",
              },
            });
          res.status(204).send();
        }
      );
    }
  );
};

/**
 * ✅ POST /reminders/:reminderId/taken
 */
export const markTaken = (req, res) => {
  const { reminderId } = req.params;
  const { date, time } = req.body;

  if (!date || !time) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields: date, time",
      },
    });
  }

  console.log(`💊 Reminder ${reminderId} taken at ${date} ${time}`);
  res.status(200).json({
    status: "recorded",
    recordedAt: new Date().toISOString(),
  });
};
