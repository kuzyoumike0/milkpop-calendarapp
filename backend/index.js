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
      dates DATE[] NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      linkid TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL,
      username TEXT NOT NULL,
      answers JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initDB();

// === 日程登録（共有リンク発行） ===
app.post("/api/schedule", async (req, res) => {
  const { title, dates, timeslot, range_mode } = req.body;
  if (!title || !dates || !timeslot || !range_mode) {
    return res.status(400).json({ error: "必須項目が不足しています" });
  }

  const linkid = uuidv4();
  await pool.query(
    "INSERT INTO schedules (title, dates, timeslot, range_mode, linkid) VALUES ($1, $2, $3, $4, $5)",
    [title, dates, timeslot, range_mode, linkid]
  );

  res.json({ link: `/share/${linkid}`, linkid });
});

// === 個人スケジュール登録 ===
app.post("/api/personal", async (req, res) => {
  const { title, memo, dates, timeslot, range_mode } = req.body;
  if (!title || !dates || !timeslot || !range_mode) {
    return res.status(400).json({ error: "必須項目が不足しています" });
  }

  await pool.query(
    "INSERT INTO schedules (title, memo, dates, timeslot, range_mode, linkid) VALUES ($1,$2,$3,$4,$5,$6)",
    [title, memo, dates, timeslot, range_mode, uuidv4()]
  );

  res.json({ success: true });
});

// === 共有スケジュール取得 ===
app.get("/api/schedule/:linkid", async (req, res) => {
  const { linkid } = req.params;

  const schedulesRes = await pool.query(
    "SELECT * FROM schedules WHERE linkid = $1",
    [linkid]
  );

  if (schedulesRes.rows.length === 0) {
    return res.status(404).json({ error: "リンクが存在しません" });
  }

  const responsesRes = await pool.query(
    "SELECT username, answers FROM responses WHERE linkid = $1 ORDER BY created_at ASC",
    [linkid]
  );

  res.json({
    schedules: schedulesRes.rows,
    responses: responsesRes.rows,
  });
});

// === 回答保存 ===
app.post("/api/share/:linkid/response", async (req, res) => {
  const { linkid } = req.params;
  const { username, answers } = req.body;

  await pool.query(
    "INSERT INTO responses (linkid, username, answers) VALUES ($1,$2,$3)",
    [linkid, username, answers]
  );

  res.json({ success: true });
});

// === 静的ファイル配信 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
