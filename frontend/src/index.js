const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// === DB接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "calendar",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

app.use(cors());
app.use(bodyParser.json());

// === テーブル初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      id SERIAL PRIMARY KEY,
      share_id TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      username TEXT NOT NULL,
      timeslot TEXT NOT NULL,
      title TEXT NOT NULL,
      share_id TEXT
    )
  `);
}
initDB().catch((err) => console.error("DB初期化エラー:", err));

// === API ===

// 共有リンクを発行
app.post("/api/share", async (req, res) => {
  try {
    const shareId = uuidv4();
    await pool.query(`INSERT INTO share_links (share_id) VALUES ($1)`, [shareId]);
    res.json({ url: `/share/${shareId}` });
  } catch (err) {
    console.error("共有リンク発行エラー:", err);
    res.status(500).json({ error: "共有リンク発行に失敗しました" });
  }
});

// 共有リンクから予定一覧を取得
app.get("/api/share/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM schedules WHERE share_id=$1 ORDER BY 
        CASE timeslot
          WHEN '全日' THEN 1
          WHEN '昼' THEN 2
          WHEN '夜' THEN 3
          ELSE 4
        END`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("共有リンクの予定取得エラー:", err);
    res.status(500).json({ error: "予定取得に失敗しました" });
  }
});

// 共有リンクから予定を追加
app.post("/api/share/:id/add", async (req, res) => {
  const { id } = req.params;
  const { username, timeslot, title } = req.body;
  try {
    await pool.query(
      `INSERT INTO schedules (date, username, timeslot, title, share_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [new Date().toISOString().split("T")[0], username, timeslot, title, id]
    );
    res.json({ message: "予定を追加しました" });
  } catch (err) {
    console.error("共有リンク経由の予定追加エラー:", err);
    res.status(500).json({ error: "予定追加に失敗しました" });
  }
});

// === 静的ファイル（React） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === サーバー起動 ===
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
