const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// PostgreSQL 接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ミドルウェア
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
      date DATE NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      answer TEXT NOT NULL
    )
  `);

  console.log("✅ init.sql でデータベースを初期化しました");
}
initDB();

// === API ===

// リンク作成
app.post("/api/create-link", async (req, res) => {
  try {
    const { title, dates } = req.body;
    if (!title || !dates || !Array.isArray(dates)) {
      return res.status(400).json({ error: "タイトルと日付を指定してください" });
    }

    const linkId = uuidv4();

    // links に追加
    await pool.query("INSERT INTO links (id, title) VALUES ($1, $2)", [linkId, title]);

    // schedules に複数日を追加
    for (const d of dates) {
      await pool.query("INSERT INTO schedules (link_id, date) VALUES ($1, $2)", [linkId, d]);
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// 共有リンク用データ取得
app.get("/api/link/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const link = await pool.query("SELECT * FROM links WHERE id = $1", [id]);

    if (link.rows.length === 0) {
      return res.status(404).json({ error: "リンクが見つかりません" });
    }

    const schedules = await pool.query("SELECT * FROM schedules WHERE link_id = $1", [id]);
    res.json({ title: link.rows[0].title, schedules: schedules.rows });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).json({ error: "リンク取得に失敗しました" });
  }
});

// フロントエンドにルーティング
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 サーバーはポート ${PORT} で実行されています`);
});
