const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT
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
      available BOOLEAN NOT NULL
    );
  `);

  console.log("✅ init.sql でデータベースを初期化しました");
}

// === API ===

// リンク作成
app.post("/api/create-link", async (req, res) => {
  try {
    const { title, dates } = req.body;
    if (!Array.isArray(dates)) {
      throw new Error("dates must be an array");
    }

    const linkId = uuidv4();
    await pool.query("INSERT INTO links (id, title) VALUES ($1, $2)", [linkId, title]);

    for (const d of dates) {
      await pool.query("INSERT INTO schedules (link_id, date) VALUES ($1, $2)", [linkId, d]);
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).send("リンク作成失敗");
  }
});

// リンク内容取得
app.get("/api/link/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    const link = await pool.query("SELECT * FROM links WHERE id = $1", [linkId]);
    const schedules = await pool.query("SELECT * FROM schedules WHERE link_id = $1", [linkId]);
    const responses = await pool.query(
      `SELECT r.*, s.date 
       FROM responses r 
       JOIN schedules s ON r.schedule_id = s.id 
       WHERE s.link_id = $1`,
      [linkId]
    );

    res.json({
      link: link.rows[0],
      schedules: schedules.rows,
      responses: responses.rows,
    });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).send("リンク取得失敗");
  }
});

// 回答登録
app.post("/api/respond", async (req, res) => {
  try {
    const { scheduleId, username, available } = req.body;
    await pool.query(
      "INSERT INTO responses (schedule_id, username, available) VALUES ($1, $2, $3)",
      [scheduleId, username, available]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("回答登録エラー:", err);
    res.status(500).send("回答登録失敗");
  }
});

// 静的ファイル
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

initDB();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 サーバーはポート ${PORT} で実行されています`);
});
