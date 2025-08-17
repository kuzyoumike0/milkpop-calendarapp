const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@db:5432/postgres",
});

// テーブル初期化
(async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS shared_events (
    id SERIAL PRIMARY KEY,
    share_id TEXT NOT NULL,
    username TEXT,
    title TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`);
})();

// 新しい共有リンクを発行
app.post("/api/shared/new", async (req, res) => {
  const shareId = uuidv4();
  res.json({ shareId });
});

// イベントを保存
app.post("/api/shared/:shareId", async (req, res) => {
  const { shareId } = req.params;
  const { username, title, start_time, end_time, note } = req.body;
  await pool.query(
    "INSERT INTO shared_events (share_id, username, title, start_time, end_time, note) VALUES ($1,$2,$3,$4,$5,$6)",
    [shareId, username, title, start_time, end_time, note]
  );
  res.json({ success: true });
});

// イベントを取得
app.get("/api/shared/:shareId", async (req, res) => {
  const { shareId } = req.params;
  const result = await pool.query("SELECT * FROM shared_events WHERE share_id=$1", [shareId]);
  res.json(result.rows);
});

// 静的ファイル
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
