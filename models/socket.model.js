// models/socket.model.js
import pool from "../config/db.js";
import moment from "moment-timezone";

const time = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

export const insertUser = async (user) => {
  const sql = `INSERT INTO user_master
    (first_name, last_name, email, phone_number, created_by, created_dt)
    VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [
    user.first_name,
    user.last_name,
    user.email,
    user.phone_number,
    user.first_name,
    time
  ];

  const [result] = await pool.execute(sql, params);

  // fetch the inserted row with full_name concatenated
  const [rows] = await pool.execute(
    `SELECT id, CONCAT_WS(first_name, ' ', last_name) AS full_name,
            email, phone_number, created_by, created_dt
     FROM user_master
     WHERE id = ?`,
    [result.insertId]
  );
  return rows[0];
};

export const getAllUsers = async () => {
  const sql = `SELECT id, CONCAT(first_name, ' ', IFNULL(last_name, '')) AS full_name,
                      email, phone_number, created_by, created_dt
               FROM user_master
               WHERE deleted = 0
               ORDER BY id ASC`;
  const [rows] = await pool.execute(sql);
  return rows;
};
