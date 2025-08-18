const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = 8080;

// DB 接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@db:5432/postgres",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());

// DB 初期化
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      id SERIAL PRIMARY KEY,
      share_id TEXT UNIQUE NOT NULL,
      dates TEXT[] NOT NULL,
      slotmode TEXT,
      slot TEXT,
      start_time TEXT,
      end_time TEXT,
      title TEXT,
      username TEXT
    );
  `);
}
initDB();

// API: 新しい共有リンク作成
app.post("/api/share-link", async (req, res) => {
  try {
    const { dates, slotmode, slot, start_time, end_time, title, username } = req.body;
    const shareId = uuidv4();
    await pool.query(
      `INSERT INTO share_links (share_id, dates, slotmode, slot, start_time, end_time, title, username)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [shareId, dates, slotmode, slot, start_time, end_time, title, username]
    );
    res.json({ shareId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DBエラー" });
  }
});

// API: 共有リンク情報取得
app.get("/api/share-link/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM share_links WHERE share_id=$1", [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "取得エラー" });
  }
});

// 静的ファイル配信
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 起動
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
