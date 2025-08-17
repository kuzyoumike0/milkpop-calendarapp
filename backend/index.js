const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

app.get("/api/events", async (req, res) => {
  const result = await pool.query("SELECT * FROM events ORDER BY date");
  res.json(result.rows);
});

app.post("/api/events", async (req, res) => {
  const { title, date, slot } = req.body;
  await pool.query("INSERT INTO events (title, date, slot) VALUES ($1, $2, $3)", [title, date, slot]);
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
