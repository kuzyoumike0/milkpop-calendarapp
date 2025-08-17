
const express = require("express");
const path = require("path");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function migrate(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_events (
      id SERIAL PRIMARY KEY,
      share_id UUID UNIQUE NOT NULL,
      title TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_event_dates (
      id SERIAL PRIMARY KEY,
      share_id UUID NOT NULL,
      event_date DATE NOT NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_answers (
      id SERIAL PRIMARY KEY,
      share_id UUID NOT NULL,
      username TEXT NOT NULL,
      event_date DATE NOT NULL,
      timeslot TEXT NOT NULL DEFAULT '全日',
      memo TEXT
    );
  `);
}
migrate();

// health
app.get("/api/health", (_, res) => res.json({ ok: true }));

// Create share and dates
app.post("/api/share", async (req, res) => {
  const { title, dates } = req.body; // dates: array of ISO date strings
  if (!title || !Array.isArray(dates) || dates.length === 0){
    return res.status(400).json({ error: "title and dates are required" });
  }
  const share_id = uuidv4();
  await pool.query("INSERT INTO shared_events (share_id, title) VALUES ($1,$2)", [share_id, title]);
  const values = dates.map(d => `('${share_id}','${d}')`).join(",");
  await pool.query(`INSERT INTO shared_event_dates (share_id, event_date) VALUES ${values}`);
  res.json({ share_id });
});

// Fetch share info
app.get("/api/share/:id", async (req, res) => {
  const { id } = req.params;
  const ev = await pool.query("SELECT * FROM shared_events WHERE share_id=$1", [id]);
  if (ev.rows.length === 0) return res.status(404).json({ error: "not found" });
  const dates = await pool.query("SELECT id, event_date FROM shared_event_dates WHERE share_id=$1 ORDER BY event_date ASC", [id]);
  res.json({ event: ev.rows[0], dates: dates.rows });
});

// Answers CRUD
app.get("/api/share/:id/answers", async (req,res) => {
  const { id } = req.params;
  const rows = await pool.query("SELECT * FROM shared_answers WHERE share_id=$1 ORDER BY event_date ASC, id ASC", [id]);
  res.json(rows.rows);
});

app.post("/api/share/:id/answers", async (req,res) => {
  const { id } = req.params;
  const { username, event_date, timeslot, memo } = req.body;
  if (!username || !event_date) return res.status(400).json({ error: "username and event_date required" });
  const r = await pool.query(
    "INSERT INTO shared_answers (share_id, username, event_date, timeslot, memo) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [id, username, event_date, timeslot || '全日', memo || null]
  );
  res.json(r.rows[0]);
});

app.put("/api/answers/:answerId", async (req,res) => {
  const { answerId } = req.params;
  const { username, event_date, timeslot, memo } = req.body;
  const r = await pool.query(
    "UPDATE shared_answers SET username=$1, event_date=$2, timeslot=$3, memo=$4 WHERE id=$5 RETURNING *",
    [username, event_date, timeslot, memo, answerId]
  );
  res.json(r.rows[0]);
});

app.delete("/api/answers/:answerId", async (req,res) => {
  const { answerId } = req.params;
  await pool.query("DELETE FROM shared_answers WHERE id=$1", [answerId]);
  res.json({ ok: true });
});

// Serve built frontend from ./public (Dockerfile copies dist -> ./public)
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));
app.get("*", (_, res) => res.sendFile(path.join(publicDir, "index.html")));

app.listen(PORT, () => console.log(`✅ Backend listening on ${PORT}`));
