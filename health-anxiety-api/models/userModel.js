import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createUser = (userData, callback) => {
  const id = "u_" + uuidv4().split("-")[0];
  const sql = `
    INSERT INTO ms_users 
    (id, name, gender, username, email, password, role_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
  const values = [
    id,
    userData.fullName, // ambil dari body tapi simpan ke kolom 'nama'
    userData.gender,
    userData.mobile,   // kita gunakan mobile sebagai username
    userData.email || `${userData.mobile}@example.com`, // fallback jika tidak ada email
    userData.password,
    2 // default role_id = 2 (misalnya user biasa)
  ];

  db.query(sql, values, (err, result) => {
    if (err) return callback(err);
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

