const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === PostgreSQL 接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "calendar",
        port: process.env.DB_PORT || 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      linkId TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (username, date, timeslot, linkId)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_links (
      id SERIAL PRIMARY KEY,
      linkId TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB();

// === API ===

// 共有リンク作成
app.post("/api/create-link", async (req, res) => {
  try {
    const linkId = uuidv4();
    await pool.query("INSERT INTO shared_links (linkId) VALUES ($1)", [linkId]);
    res.json({ linkId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "リンク作成失敗" });
  }
});

// 個人スケジュール登録 (UPSERT)
app.post("/api/schedule", async (req, res) => {
  const { username, date, timeslot, linkId } = req.body;
  try {
    await pool.query(
      `
      INSERT INTO schedules (username, date, timeslot, linkId)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username, date, timeslot, linkId)
      DO UPDATE SET username = EXCLUDED.username
    `,
      [username, date, timeslot, linkId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "スケジュール登録失敗" });
  }
});

// 個人スケジュール取得
app.get("/api/schedules/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      "SELECT username, date, timeslot FROM schedules WHERE linkId = $1 ORDER BY date, timeslot",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// === 本番用: Reactビルド配信 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === 起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
