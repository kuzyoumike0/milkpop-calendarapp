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
  try {
    const { title, dates, timeslot, range_mode } = req.body;
    if (!title || !dates || !timeslot || !range_mode) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    const normalizedDates = Array.isArray(dates)
      ? dates.map((d) => new Date(d).toISOString().split("T")[0])
      : [];

    if (normalizedDates.length === 0) {
      return res.status(400).json({ error: "日付が選択されていません" });
    }

    const linkid = uuidv4();
    await pool.query(
      "INSERT INTO schedules (title, dates, timeslot, range_mode, linkid) VALUES ($1, $2, $3, $4, $5)",
      [title, normalizedDates, timeslot, range_mode, linkid]
    );

    res.json({ link: `/share/${linkid}`, linkid });
  } catch (err) {
    console.error("リンク発行エラー:", err);
    res.status(500).json({ error: "リンク発行に失敗しました" });
  }
});

// === 個人スケジュール登録 ===
app.post("/api/personal", async (req, res) => {
  const { title, memo, dates, timeslot, range_mode } = req.body;
  if (!title || !dates || !timeslot || !range_mode) {
    return res.status(400).json({ error: "必須項目が不足しています" });
  }

  const normalizedDates = Array.isArray(dates)
    ? dates.map((d) => new Date(d).toISOString().split("T")[0])
    : [];

  await pool.query(
    "INSERT INTO schedules (title, memo, dates, timeslot, range_mode, linkid) VALUES ($1,$2,$3,$4,$5,$6)",
    [title, memo, normalizedDates, timeslot, range_mode, uuidv4()]
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
  try {
    const { linkid } = req.params;
    const { username, answers } = req.body;

    if (!username || !answers) {
      return res.status(400).json({ error: "名前と回答は必須です" });
    }

    await pool.query(
      "INSERT INTO responses (linkid, username, answers) VALUES ($1,$2,$3)",
      [linkid, username, answers]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("回答保存エラー:", err);
    res.status(500).json({ error: "回答保存に失敗しました" });
  }
});

// === 静的ファイル配信 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
