const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB接続設定 ===
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
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      linkid TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB();

// === API ===

// 個人予定登録
app.post("/api/personal", async (req, res) => {
  try {
    const { title, memo, date, timeslot, rangeMode } = req.body;
    const result = await pool.query(
      "INSERT INTO schedules (title, memo, date, timeslot, range_mode) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [title, memo, date, timeslot, rangeMode]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save personal schedule" });
  }
});

// 共有用スケジュール作成
app.post("/api/share", async (req, res) => {
  try {
    const { title, memo, date, timeslot, rangeMode } = req.body;
    const linkid = uuidv4();
    const result = await pool.query(
      "INSERT INTO schedules (title, memo, date, timeslot, range_mode, linkid) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [title, memo, date, timeslot, rangeMode, linkid]
    );
    res.json({ link: `/share/${linkid}`, schedule: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create share schedule" });
  }
});

// 共有リンクからスケジュール取得
app.get("/api/share/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const schedules = await pool.query(
      "SELECT * FROM schedules WHERE linkid = $1 ORDER BY date ASC",
      [linkid]
    );
    res.json(schedules.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch share schedule" });
  }
});

// 共有スケジュールへのレスポンス保存
app.post("/api/response", async (req, res) => {
  try {
    const { schedule_id, username, response } = req.body;
    const result = await pool.query(
      "INSERT INTO responses (schedule_id, username, response) VALUES ($1,$2,$3) RETURNING *",
      [schedule_id, username, response]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save response" });
  }
});

// レスポンス一覧取得
app.get("/api/response/:schedule_id", async (req, res) => {
  try {
    const { schedule_id } = req.params;
    const responses = await pool.query(
      "SELECT * FROM responses WHERE schedule_id = $1 ORDER BY created_at ASC",
      [schedule_id]
    );
    res.json(responses.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

// === 本番ビルド配信 (React) ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
