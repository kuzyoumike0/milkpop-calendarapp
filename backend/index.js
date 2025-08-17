const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// ---- Calendars ----
app.get("/api/calendars", async (req, res) => {
  try {
    const q = await pool.query("SELECT * FROM calendars ORDER BY id ASC");
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send("DB calendars error");
  }
});

app.post("/api/calendars", async (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).send("Missing name");
  const c = color || "#60a5fa";
  try {
    const q = await pool.query(
      "INSERT INTO calendars (name, color) VALUES ($1, $2) RETURNING *",
      [name, c]
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send("DB insert calendar error");
  }
});

// ---- Schedules ----
app.get("/api/schedules", async (req, res) => {
  try {
    const { calendarIds } = req.query; // comma-separated ids
    let rows;
    if (calendarIds) {
      const ids = calendarIds.split(",").map((x) => parseInt(x, 10)).filter(Boolean);
      if (ids.length === 0) {
        return res.json([]);
      }
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
      const q = await pool.query(
        `SELECT s.*, c.name as calendar_name, c.color as calendar_color
         FROM schedules s
         LEFT JOIN calendars c ON s.calendar_id = c.id
         WHERE s.calendar_id IN (${placeholders})
         ORDER BY s.date ASC`,
        ids
      );
      rows = q.rows;
    } else {
      const q = await pool.query(
        `SELECT s.*, c.name as calendar_name, c.color as calendar_color
         FROM schedules s
         LEFT JOIN calendars c ON s.calendar_id = c.id
         ORDER BY s.date ASC`
      );
      rows = q.rows;
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

app.post("/api/schedules", async (req, res) => {
  const { title, date, timeslot, calendar_id } = req.body;
  if (!title || !date) return res.status(400).send("Missing data");

  try {
    const q = await pool.query(
      "INSERT INTO schedules (title, date, timeslot, calendar_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, date, timeslot || "全日", calendar_id || null]
    );
    res.json(q.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB insert error");
  }
});

// Static React
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});