const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// 静的ファイル（frontend build）
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// 個人スケジュール用テーブル作成
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      username TEXT,
      title TEXT,
      memo TEXT,
      start_date DATE,
      end_date DATE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_links (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_events (
      id SERIAL PRIMARY KEY,
      link_id TEXT,
      username TEXT,
      title TEXT,
      memo TEXT,
      start_date DATE,
      end_date DATE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initDB();

// 個人スケジュール
app.get("/api/schedules", async (req, res) => {
  const result = await pool.query("SELECT * FROM schedules ORDER BY start_date");
  res.json(result.rows);
});
app.post("/api/schedules", async (req, res) => {
  const { username, title, memo, start_date, end_date } = req.body;
  const result = await pool.query(
    "INSERT INTO schedules (username, title, memo, start_date, end_date) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [username, title, memo, start_date, end_date]
  );
  res.json(result.rows[0]);
});
app.delete("/api/schedules/:id", async (req, res) => {
  await pool.query("DELETE FROM schedules WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

// 共有カレンダーリンク発行
app.post("/api/shared_links", async (req, res) => {
  const id = uuidv4();
  await pool.query("INSERT INTO shared_links (id) VALUES ($1)", [id]);
  res.json({ url: `/share/${id}` });
});

// 共有イベント
app.get("/api/shared/:link_id", async (req, res) => {
  const result = await pool.query("SELECT * FROM shared_events WHERE link_id=$1", [req.params.link_id]);
  res.json(result.rows);
});
app.post("/api/shared/:link_id", async (req, res) => {
  const { username, title, memo, start_date, end_date } = req.body;
  const result = await pool.query(
    "INSERT INTO shared_events (link_id, username, title, memo, start_date, end_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [req.params.link_id, username, title, memo, start_date, end_date]
  );
  res.json(result.rows[0]);
});
app.delete("/api/shared/:link_id/:id", async (req, res) => {
  await pool.query("DELETE FROM shared_events WHERE link_id=$1 AND id=$2", [req.params.link_id, req.params.id]);
  res.json({ success: true });
});

// React用にSPAルーティング
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("Backend running on " + port));
