const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// ===== Google Calendar APIによる祝日取得 =====
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";
const JAPANESE_HOLIDAY_CALENDAR_ID = "ja.japanese#holiday@group.v.calendar.google.com";

app.get("/api/holidays", async (req, res) => {
  try {
    const now = new Date();
    const startYear = now.getFullYear();
    const endYear = startYear + 1; // 今年＋来年

    const timeMin = new Date(startYear, 0, 1).toISOString();
    const timeMax = new Date(endYear, 11, 31).toISOString();

    if (!GOOGLE_API_KEY) {
      return res.json({});
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      JAPANESE_HOLIDAY_CALENDAR_ID
    )}/events?key=${GOOGLE_API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&orderBy=startTime&singleEvents=true`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) {
      return res.json({});
