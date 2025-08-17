import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
import { v4 as uuidv4 } from "uuid";

const { Pool } = pkg;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("frontend"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// DB初期化
async function initDB() {
  await pool.query(`CREATE TABLE IF NOT EXISTS shared_sessions(
    token TEXT PRIMARY KEY,
    title TEXT,
    allowed_dates JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS shared_events(
    id SERIAL PRIMARY KEY,
    token TEXT,
    date TEXT,
    time_slot TEXT,
    member_name TEXT,
    memo TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
}
initDB();

// API
app.post("/api/shared/session", async (req, res) => {
  const { title, allowed_dates } = req.body;
  if (!title || !allowed_dates) return res.status(400).json({ error: "allowed_dates_required" });
  const token = uuidv4();
  await pool.query("INSERT INTO shared_sessions(token, title, allowed_dates) VALUES($1,$2,$3)", [
    token,
    title,
    JSON.stringify(allowed_dates),
  ]);
  res.json({ token });
});

app.get("/api/shared/session/:token", async (req, res) => {
  const { token } = req.params;
  const result = await pool.query("SELECT * FROM shared_sessions WHERE token=$1", [token]);
  res.json(result.rows[0]);
});

app.get("/api/shared/session/:token/events", async (req, res) => {
  const { token } = req.params;
  const result = await pool.query("SELECT * FROM shared_events WHERE token=$1 ORDER BY date ASC", [token]);
  res.json(result.rows);
});

app.post("/api/shared/session/:token/register", async (req, res) => {
  const { token } = req.params;
  const { date, time_slot, member_name, memo } = req.body;
  await pool.query("INSERT INTO shared_events(token, date, time_slot, member_name, memo) VALUES($1,$2,$3,$4,$5)", [
    token,
    date,
    time_slot,
    member_name,
    memo,
  ]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server running on " + PORT));
