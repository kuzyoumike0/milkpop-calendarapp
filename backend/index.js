const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // RailwayではSSL必須
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
  try {
    const initSQL = path.join(__dirname, "init.sql");
    const sql = fs.readFileSync(initSQL).toString();
    await pool.query(sql);
    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ DB初期化エラー:", err);
  }
}
initDB();

// === Google日本の祝日取得 API ===
app.get("/api/holidays", async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const url = `https://www.googleapis.com/calendar/v3/calendars/japanese__ja@holiday.calendar.google.com/events?key=${process.env.GOOGLE_API_KEY}&timeMin=${year}-01-01T00:00:00Z&timeMax=${year}-12-31T23:59:59Z`;
    const response = await fetch(url);
    const data = await response.json();
    const holidays = data.items.map((item) => ({
      date: item.start.date,
      name: item.summary,
    }));
    res.json(holidays);
  } catch (err) {
    res.status(500).json({ error: "祝日取得エラー", detail: err.message });
  }
});

// === 共有スケジュール登録 ===
app.post("/api/schedule", async (req, res) => {
  const { title, range_mode, dates, start_time, end_time } = req.body;
  const linkid = uuidv4();

  if (start_time >= end_time) {
    return res.status(400).json({ error: "終了時刻は開始時刻より後にしてください。" });
  }

  try {
    await pool.query(
      "INSERT INTO schedules (linkid, title, range_mode, dates, start_time, end_time) VALUES ($1,$2,$3,$4,$5,$6)",
      [linkid, title, range_mode, dates, start_time, end_time]
    );
    res.json({ link: `/share/${linkid}` });
  } catch (err) {
    res.status(500).json({ error: "スケジュール登録失敗", detail: err.message });
  }
});

// === 個人スケジュール登録 ===
app.post("/api/personal", async (req, res) => {
  const { title, memo, range_mode, dates, start_time, end_time } = req.body;

  if (start_time >= end_time) {
    return res.status(400).json({ error: "終了時刻は開始時刻より後にしてください。" });
  }

  try {
    await pool.query(
      "INSERT INTO personal_schedules (title, memo, range_mode, dates, start_time, end_time) VALUES ($1,$2,$3,$4,$5,$6)",
      [title, memo, range_mode, dates, start_time, end_time]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "個人スケジュール登録失敗", detail: err.message });
  }
});

// === 個人スケジュール取得 ===
app.get("/api/personal", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, memo, range_mode, dates, start_time, end_time, created_at FROM personal_schedules ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "個人スケジュール取得失敗", detail: err.message });
  }
});

// === 共有スケジュール取得 ===
app.get("/api/schedule/:linkid", async (req, res) => {
  const { linkid } = req.params;
  try {
    const schedulesRes = await pool.query("SELECT * FROM schedules WHERE linkid=$1", [linkid]);
    if (schedulesRes.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }
    const responsesRes = await pool.query(
      "SELECT username, answers FROM responses WHERE linkid=$1 ORDER BY created_at ASC",
      [linkid]
    );
    res.json({ schedules: schedulesRes.rows, responses: responsesRes.rows });
  } catch (err) {
    res.status(500).json({ error: "取得失敗", detail: err.message });
  }
});

// === 回答保存 ===
app.post("/api/share/:linkid/response", async (req, res) => {
  const { linkid } = req.params;
  const { username, answers } = req.body;
  try {
    await pool.query(
      "INSERT INTO responses (linkid, username, answers) VALUES ($1,$2,$3)",
      [linkid, username, answers]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "回答保存失敗", detail: err.message });
  }
});

// === 静的ファイル配信 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
