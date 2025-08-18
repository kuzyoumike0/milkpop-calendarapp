const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// === Express サーバー初期化 ===
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// === PostgreSQL 接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB 初期化関数 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      username TEXT NOT NULL,
      timeslot TEXT NOT NULL,
      title TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      id SERIAL PRIMARY KEY,
      share_id TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initDB().catch((err) => {
  console.error("DB初期化エラー:", err);
  process.exit(1);
});

// === API ===

// 📌 予定の追加
app.post("/api/schedules", async (req, res) => {
  try {
    const { date, username, timeslot, title } = req.body;
    if (!date || !username || !timeslot || !title) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    await pool.query(
      "INSERT INTO schedules (date, username, timeslot, title) VALUES ($1,$2,$3,$4)",
      [date, username, timeslot, title]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("予定追加エラー:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// 📌 特定日の予定取得
app.get("/api/schedules", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "date が必要です" });

    const result = await pool.query(
      "SELECT * FROM schedules WHERE date = $1 ORDER BY id ASC",
      [date]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("予定取得エラー:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// 📌 共有リンクの発行
app.post("/api/share", async (req, res) => {
  try {
    const shareId = uuidv4();
    await pool.query(
      "INSERT INTO share_links (share_id) VALUES ($1) ON CONFLICT (share_id) DO NOTHING",
      [shareId]
    );

    res.json({ shareId, url: `/share/${shareId}` });
  } catch (err) {
    console.error("共有リンク発行エラー:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// 📌 共有リンクから予定を取得
app.get("/api/share/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const link = await pool.query(
      "SELECT * FROM share_links WHERE share_id = $1",
      [id]
    );

    if (link.rowCount === 0) {
      return res.status(404).json({ error: "共有リンクが存在しません" });
    }

    const schedules = await pool.query(
      "SELECT * FROM schedules ORDER BY date ASC, id ASC"
    );

    res.json({ schedules: schedules.rows });
  } catch (err) {
    console.error("共有リンク取得エラー:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// === サーバー起動 ===
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
