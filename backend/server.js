const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      date DATE NOT NULL,
      time_slot TEXT NOT NULL,
      memo TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
})();

app.get("/api/schedules", async (req, res) => {
  const { date } = req.query;
  const result = await pool.query("SELECT * FROM schedules WHERE date=$1", [date]);
  res.json(result.rows);
});

app.post("/api/schedules", async (req, res) => {
  const { username, date, time_slot, memo } = req.body;
  const result = await pool.query(
    "INSERT INTO schedules (username, date, time_slot, memo) VALUES ($1,$2,$3,$4) RETURNING *",
    [username, date, time_slot, memo]
  );
  res.json(result.rows[0]);
});

app.put("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;
  const { username, time_slot, memo } = req.body;
  const result = await pool.query(
    "UPDATE schedules SET username=$1, time_slot=$2, memo=$3 WHERE id=$4 RETURNING *",
    [username, time_slot, memo, id]
  );
  res.json(result.rows[0]);
});

app.delete("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM schedules WHERE id=$1", [id]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on ${PORT}`));
