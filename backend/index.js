const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// PostgreSQL接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// DB初期化
app.get("/init", async (req, res) => {
  try {
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
    res.send("DB initialized");
  } catch (err) {
    console.error(err);
    res.status(500).send("DB init error");
  }
});

// イベント取得
app.get("/api/events", async (req, res) => {
  const { linkId } = req.query;
  try {
    const result = linkId
      ? await pool.query("SELECT * FROM events WHERE link_id=$1", [linkId])
      : await pool.query("SELECT * FROM events");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching events");
  }
});

// イベント追加
app.post("/api/events", async (req, res) => {
  const { title, start_date, end_date, username, memo, link_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO events (title, start_date, end_date, username, memo, link_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [title, start_date, end_date, username, memo, link_id || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding event");
  }
});

// イベント編集
app.put("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const { title, start_date, end_date, username, memo } = req.body;
  try {
    const result = await pool.query(
      "UPDATE events SET title=$1, start_date=$2, end_date=$3, username=$4, memo=$5 WHERE id=$6 RETURNING *",
      [title, start_date, end_date, username, memo, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating event");
  }
});

// イベント削除
app.delete("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM events WHERE id=$1", [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting event");
  }
});

// 共有リンク発行
app.post("/api/generate-link", async (req, res) => {
  const linkId = uuidv4();
  res.json({ link: `/shared/${linkId}`, linkId });
});

app.listen(PORT, () => {
  console.log(`Backend running on ${PORT}`);
});
