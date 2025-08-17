const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@db:5432/calendar"
});

// DB 初期化
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      username TEXT,
      memo TEXT,
      link_id TEXT
    );
  `);
})();

// イベント一覧
app.get("/api/events", async (req, res) => {
  const result = await pool.query("SELECT * FROM events ORDER BY start_date");
  res.json(result.rows);
});

// イベント追加
app.post("/api/events", async (req, res) => {
  const { title, start_date, end_date, username, memo, link_id } = req.body;
  const result = await pool.query(
    "INSERT INTO events (title, start_date, end_date, username, memo, link_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [title, start_date, end_date, username, memo, link_id]
  );
  res.json(result.rows[0]);
});

// イベント削除
app.delete("/api/events/:id", async (req, res) => {
  await pool.query("DELETE FROM events WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`✅ Backend running on ${port}`));
