const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "calendar",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      username TEXT,
      linkid TEXT
    );
  `);
}
initDB();

// === API ===

// 新規スケジュール登録
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, memo, date, timeslot, range_mode, username, linkid } = req.body;
    const result = await pool.query(
      `INSERT INTO schedules (title, memo, date, timeslot, range_mode, username, linkid)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, memo, date, timeslot, range_mode, username, linkid]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("スケジュール登録エラー:", err);
    res.status(500).json({ error: "スケジュール登録に失敗しました" });
  }
});

// スケジュール取得
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules ORDER BY date ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// 共有リンク発行
app.post("/api/share", async (req, res) => {
  try {
    const linkid = uuidv4();
    res.json({ url: `/share/${linkid}`, linkid });
  } catch (err) {
    res.status(500).json({ error: "リンク作成失敗" });
  }
});

// 静的ファイル提供 (本番用)
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
