import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// DB初期化
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      title TEXT NOT NULL,
      username TEXT,
      memo TEXT,
      timeslot TEXT
    )
  `);
})();

// API
app.get("/api/events", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM events ORDER BY date ASC");
  res.json(rows);
});

app.post("/api/events", async (req, res) => {
  const { date, title, username, memo, timeslot } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO events(date, title, username, memo, timeslot) VALUES($1,$2,$3,$4,$5) RETURNING *",
    [date, title, username, memo, timeslot]
  );
  res.json(rows[0]);
});

app.put("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const { title, username, memo, timeslot } = req.body;
  const { rows } = await pool.query(
    "UPDATE events SET title=$1, username=$2, memo=$3, timeslot=$4 WHERE id=$5 RETURNING *",
    [title, username, memo, timeslot, id]
  );
  res.json(rows[0]);
});

app.delete("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM events WHERE id=$1", [id]);
  res.json({ success: true });
});

// 静的ファイル提供
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`✅ Server running on ${port}`));
