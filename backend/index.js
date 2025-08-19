const express = require("express");
const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// ===== メモリDB（簡易保存用、本番はPostgreSQL推奨） =====
let schedules = {};     // { linkId: { title, dates: [] } }
let personalSchedules = []; // 個人登録

// ===== Google Calendar API祝日対応 =====
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";
const JAPANESE_HOLIDAY_CALENDAR_ID = "ja.japanese#holiday@group.v.calendar.google.com";

app.get("/api/holidays", async (req, res) => {
  try {
    const now = new Date();
    const startYear = now.getFullYear();
    const endYear = startYear + 1;

    const timeMin = new Date(startYear, 0, 1).toISOString();
    const timeMax = new Date(endYear, 11, 31).toISOString();

    if (!GOOGLE_API_KEY) return res.json({});

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      JAPANESE_HOLIDAY_CALENDAR_ID
    )}/events?key=${GOOGLE_API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&orderBy=startTime&singleEvents=true`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) return res.json({});

    const holidays = {};
    data.items.forEach((event) => {
      holidays[event.start.date] = event.summary;
    });

    res.json(holidays);
  } catch (err) {
    console.error("Holiday API Error:", err);
    res.json({});
  }
});

// ===== 個人日程登録 =====
app.post("/api/personal", (req, res) => {
  const { title, memo, dates, timeslot } = req.body;
  personalSchedules.push({ title, memo, dates, timeslot });
  res.json(personalSchedules);
});

app.get("/api/personal", (req, res) => {
  res.json(personalSchedules);
});

// ===== 日程登録と共有リンク発行 =====
app.post("/api/schedule", (req, res) => {
  const { title, dates, timeslot } = req.body;
  const linkId = uuidv4();
  schedules[linkId] = { title, dates, timeslot, responses: [] };
  res.json({ linkId });
});

app.get("/api/schedule/:linkId", (req, res) => {
  const { linkId } = req.params;
  res.json(schedules[linkId] || {});
});

// ===== 日程共有ページでの回答保存 =====
app.post("/api/schedule/:linkId/respond", (req, res) => {
  const { linkId } = req.params;
  const { username, responses } = req.body; // { date: "◯/✖" }
  if (!schedules[linkId]) return res.status(404).json({ error: "Not found" });

  schedules[linkId].responses.push({ username, responses });
  res.json(schedules[linkId]);
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
