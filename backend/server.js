const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- DB 初期化 ---
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      title TEXT NOT NULL,
      memo TEXT,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL DEFAULT '全日'
    )
  `);
}
initDB();

// --- API ---
app.get("/api/schedules", async (req, res) => {
  const result = await pool.query("SELECT * FROM schedules ORDER BY date ASC");
  res.json(result.rows);
});

app.post("/api/schedules", async (req, res) => {
  const { username, title, memo, date, timeslot } = req.body;
  const result = await pool.query(
    "INSERT INTO schedules (username, title, memo, date, timeslot) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [username, title, memo, date, timeslot]
  );
  res.json(result.rows[0]);
});

app.put("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;
  const { username, title, memo, date, timeslot } = req.body;
  const result = await pool.query(
    "UPDATE schedules SET username=$1, title=$2, memo=$3, date=$4, timeslot=$5 WHERE id=$6 RETURNING *",
    [username, title, memo, date, timeslot, id]
  );
  res.json(result.rows[0]);
});

app.delete("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM schedules WHERE id=$1", [id]);
  res.json({ success: true });
});

// --- 静的ファイル配信 ---
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(process.env.PORT || 8080, () =>
  console.log("✅ Server running on port " + (process.env.PORT || 8080))
);