const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

(async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    memo TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    link_id TEXT
  )`);
})();

app.get("/api/schedules", async (req, res) => {
  const result = await pool.query("SELECT * FROM schedules ORDER BY start_date");
  res.json(result.rows);
});

app.post("/api/schedules", async (req, res) => {
  const { title, memo, start_date, end_date } = req.body;
  const linkId = uuidv4();
  const result = await pool.query(
    "INSERT INTO schedules (title, memo, start_date, end_date, link_id) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [title, memo, start_date, end_date, linkId]
  );
  res.json(result.rows[0]);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on ${PORT}`));
