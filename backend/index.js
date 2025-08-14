const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// ミドルウェア設定
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL 接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// テーブル作成（初回のみ）
const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      time_slot TEXT NOT NULL, -- "morning" | "afternoon" | "evening"
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
createTable();

// 予定取得API
app.get("/api/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date, time_slot");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "データ取得に失敗しました" });
  }
});

// 予定追加API
app.post("/api/events", async (req, res) => {
  try {
    const { title, date, time_slot } = req.body;
    if (!title || !date || !time_slot) {
      return res.status(400).json({ error: "すべてのフィールドを入力してください" });
    }
    const result = await pool.query(
      "INSERT INTO events (title, date, time_slot) VALUES ($1, $2, $3) RETURNING *",
      [title, date, time_slot]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "データ追加に失敗しました" });
  }
});

app.listen(port, () => {
  console.log(`✅ サーバーがポート ${port} で起動しました`);
});
