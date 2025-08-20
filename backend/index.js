const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
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
  const initSQL = path.join(__dirname, "init.sql");
  const fs = require("fs");
  const sql = fs.readFileSync(initSQL).toString();
  await pool.query(sql);
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
  const { title, range_mode, dates, timeslot } = req.body;
  const linkid = uuidv4();

  try {
    await pool.query(
      "INSERT INTO schedules (linkid, title, range_mode, dates, timeslot) VALUES ($1,$2,$3,$4,$5)",
      [linkid, title, range_mode, dates, timeslot]
    );
    res.json({ link: `/share/${linkid}` });
  } catch (err) {
    res.status(500).json({ error: "スケジュール登録失敗", detail: err.message });
  }
});

// === 個人スケジュール登録 ===
app.post("/api/personal", async (req, res) => {
  const { title, memo, range_mode, dates, timeslot } = req.body;
  try {
    await pool.query(
      "INSERT INTO personal_schedules (title, memo, range_mode, dates, timeslot) VALUES ($1,$2,$3,$4,$5)",
      [title, memo, range_mode, dates, timeslot]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "個人スケジュール登録失敗", detail: err.message });
  }
});

// === 共有スケジュール取得 ===
app.get("/api/schedule/:linkid", async (req, res) => {
  const { linkid } = req.params;
  try {
    const schedulesRes = await pool.query("SELECT * FROM schedules WHERE linkid=$1", [linkid]);
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
