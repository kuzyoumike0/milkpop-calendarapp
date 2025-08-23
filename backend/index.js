const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Railway の環境変数を使って接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ====== 初期化: テーブル作成 ======
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT,
      date DATE NOT NULL,
      selection_mode TEXT,
      time_type TEXT,
      start_time TEXT,
      end_time TEXT
    );
  `);
};
initDB();

// ====== スケジュール保存 ======
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, date, selectionMode, timeType, startTime, endTime } = req.body;
    const result = await pool.query(
      `INSERT INTO schedules (title, date, selection_mode, time_type, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, date, selectionMode, timeType, startTime, endTime]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB insert error" });
  }
});

// ====== スケジュール一覧取得 ======
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM schedules ORDER BY date ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB fetch error" });
  }
});

// ====== サーバー起動 ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ MilkPOP Calendar API running on port ${PORT}`);
});
