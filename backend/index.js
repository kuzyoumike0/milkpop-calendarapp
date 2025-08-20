const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB接続設定 ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      dates TEXT[] NOT NULL,
      range_mode TEXT NOT NULL,
      timeslot TEXT NOT NULL,
      linkid TEXT UNIQUE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS personal_schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      dates TEXT[] NOT NULL,
      range_mode TEXT NOT NULL,
      timeslot TEXT NOT NULL
    );
  `);
}
initDB();

// === Google Calendar 日本の祝日を取得 ===
app.get("/api/holidays", async (req, res) => {
  const year = new Date().getFullYear();
  const url = `https://www.googleapis.com/calendar/v3/calendars/ja.japanese%23holiday%40group.v.calendar.google.com/events?key=${process.env.GOOGLE_API_KEY}&timeMin=${year}-01-01T00:00:00Z&timeMax=${year}-12-31T23:59:59Z&singleEvents=true&orderBy=startTime`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const holidays = data.items.map((h) => h.start.date);
    res.json(holidays);
  } catch (e) {
    res.json([]);
  }
});

// === 共有スケジュール登録 ===
app.post("/api/schedules", async (req, res) => {
  const { title, dates, range_mode, timeslot } = req.body;
  const linkid = uuidv4();
  await pool.query(
    "INSERT INTO schedules (title, dates, range_mode, timeslot, linkid) VALUES ($1, $2, $3, $4, $5)",
    [title, dates, range_mode, timeslot, linkid]
  );
  res.json({ linkid });
});

// === 個人スケジュール登録 ===
app.post("/api/personal", async (req, res) => {
  const { title, memo, dates, range_mode, timeslot } = req.body;
  await pool.query(
    "INSERT INTO personal_schedules (title, memo, dates, range_mode, timeslot) VALUES ($1, $2, $3, $4, $5)",
    [title, memo, dates, range_mode, timeslot]
  );
  res.json({ success: true });
});

// === 個人スケジュール取得 ===
app.get("/api/personal", async (req, res) => {
  const result = await pool.query("SELECT * FROM personal_schedules ORDER BY id DESC");
  res.json(result.rows.map((r) => ({
    title: r.title,
    memo: r.memo,
    dates: r.dates,
    timeslot: r.timeslot,
  })));
});

app.use(express.static("../frontend/build"));
app.get("*", (req, res) => {
  res.sendFile("index.html", { root: "../frontend/build" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
