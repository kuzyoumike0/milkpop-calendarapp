const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      username TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      memo TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_links (
      id SERIAL PRIMARY KEY,
      link_id TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
})();

app.get("/api/schedules", async (req, res) => {
  const result = await pool.query("SELECT * FROM schedules ORDER BY start_date");
  res.json(result.rows);
});

app.post("/api/schedules", async (req, res) => {
  const { title, username, start_date, end_date, memo } = req.body;
  const result = await pool.query(
    "INSERT INTO schedules (title, username, start_date, end_date, memo) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [title, username, start_date, end_date, memo]
  );
  res.json(result.rows[0]);
});

app.post("/api/shared-link", async (req, res) => {
  const linkId = Math.random().toString(36).substring(2, 10);
  await pool.query("INSERT INTO shared_links (link_id) VALUES ($1)", [linkId]);
  res.json({ link: `/shared/${linkId}` });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Backend running on ${PORT}`));
