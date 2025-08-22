// backend/index.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== DB接続 =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ===== 静的ファイル配信 =====
app.use(express.static(path.join(__dirname, "../frontend/build")));

// ===== Security Header =====
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
  );
  next();
});

// ===== テーブル初期化 =====
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      dates JSONB NOT NULL,
      options JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_schedules (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      dates JSONB NOT NULL,
      options JSONB,
      url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};
initDB();

// ====== 個人日程保存 API ======
app.post("/api/personal-schedule", async (req, res) => {
  try {
    const { title, memo, dates, options } = req.body;
    const id = uuidv4();

    await pool.query(
      "INSERT INTO schedules (id, title, memo, dates, options) VALUES ($1, $2, $3, $4, $5)",
      [id, title, memo, JSON.stringify(dates), JSON.stringify(options)]
    );

    res.json({ ok: true, id });
  } catch (err) {
    console.error("❌ 個人日程保存エラー:", err);
    res.status(500).json({ ok: false, error: "DBエラー" });
  }
});

// ====== 共有スケジュール保存 API ======
app.post("/api/schedule", async (req, res) => {
  try {
    const { title, dates, options } = req.body;
    const id = uuidv4();
    const url = `/share/${id}`;

    await pool.query(
      "INSERT INTO share_schedules (id, title, dates, options, url) VALUES ($1, $2, $3, $4, $5)",
      [id, title, JSON.stringify(dates), JSON.stringify(options), url]
    );

    res.json({ ok: true, url });
  } catch (err) {
    console.error("❌ 共有スケジュール保存エラー:", err);
    res.status(500).json({ ok: false, error: "DBエラー" });
  }
});

// ===== フロントのルーティング対応 =====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
