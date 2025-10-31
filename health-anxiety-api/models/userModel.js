import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createUser = (userData, callback) => {
  const id = "u_" + uuidv4().split("-")[0];

  // Capitalize first letter of gender to match enum('Male', 'Female')
  const gender =
    userData.gender.charAt(0).toUpperCase() +
    userData.gender.slice(1).toLowerCase();

  const sql = `
    INSERT INTO ms_users 
    (name, gender, username, email, password, role_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
  const values = [
    userData.fullName,
    gender === "Other" ? "Male" : gender,
    userData.mobile,
    userData.email,
    userData.password,
    2, // role_id = 2 (regular user)
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return callback(err);
    }
    callback(null, { id, ...userData });
  });
};

export const findUserByMobile = (mobile, callback) => {
  const sql = "SELECT * FROM ms_users WHERE username = ?";
  db.query(sql, [mobile], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};
