const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// DB初期化
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      title TEXT NOT NULL,
      username TEXT,
      memo TEXT,
      is_shared BOOLEAN DEFAULT false
    );
  `);
}
initDB();

// APIルート
app.get("/api/events", async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query("SELECT * FROM schedules WHERE date=$1 ORDER BY id ASC", [date]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/api/events", async (req, res) => {
  const { date, title, username, memo, is_shared } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO schedules (date, title, username, memo, is_shared) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [date, title, username, memo, is_shared]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});

app.put("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const { title, username, memo } = req.body;
  try {
    const result = await pool.query(
      "UPDATE schedules SET title=$1, username=$2, memo=$3 WHERE id=$4 RETURNING *",
      [title, username, memo, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM schedules WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// Reactを返す
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
