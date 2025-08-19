const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// JSON パース有効化
app.use(bodyParser.json());

// PostgreSQL 接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
      date DATE NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      answer TEXT NOT NULL CHECK (answer IN ('yes', 'no'))
    );
  `);

  console.log("✅ init.sql でデータベースを初期化しました");
}

// === API ===

// 共有リンク作成
app.post("/api/create-link", async (req, res) => {
  try {
    let { title, dates } = req.body;
    console.log("📩 受信データ:", req.body); // ← デバッグ用

    if (!title || !dates) {
      return res.status(400).json({ error: "タイトルと日付を指定してください" });
    }

    // dates が文字列なら配列に変換
    if (!Array.isArray(dates)) {
      if (typeof dates === "string") {
        dates = dates.split(",");
      } else {
        return res.status(400).json({ error: "日付形式が不正です" });
      }
    }

    const linkId = uuidv4();

    // links に保存
    await pool.query("INSERT INTO links (id, title) VALUES ($1, $2)", [linkId, title]);

    // schedules に日付を保存
    for (const d of dates) {
      await pool.query("INSERT INTO schedules (link_id, date) VALUES ($1, $2)", [linkId, d]);
    }

    res.json({ linkId });
  } catch (err) {
    console.error("❌ リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// 共有リンクのデータ取得
app.get("/api/link/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    const linkRes = await pool.query("SELECT * FROM links WHERE id = $1", [linkId]);
    if (linkRes.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }

    const schedulesRes = await pool.query("SELECT * FROM schedules WHERE link_id = $1", [linkId]);

    res.json({
      title: linkRes.rows[0].title,
      schedules: schedulesRes.rows,
    });
  } catch (err) {
    console.error("❌ リンク取得エラー:", err);
    res.status(500).json({ error: "リンク取得に失敗しました" });
  }
});

// === React ビルド配信 (本番用) ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
app.listen(PORT, async () => {
  await initDB();
  console.log(`🚀 サーバーはポート ${PORT} で実行中`);
});
