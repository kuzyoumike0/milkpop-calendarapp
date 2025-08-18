const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// === PostgreSQL 接続設定 ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@db:5432/mydb",
});

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL,
      slot TEXT NOT NULL,
      title TEXT NOT NULL
    );
  `);
}
initDB();

// === API ===
app.get("/api/shares", async (req, res) => {
  const result = await pool.query("SELECT * FROM shares ORDER BY date ASC");
  res.json(result.rows);
});

app.post("/api/shares", async (req, res) => {
  const { date, slot, title } = req.body;
  const id = uuidv4();
  aawait pool.query("INSERT INTO shares (id, date, slot, title) VALUES ($1,$2,$3,$4)", [id, date, slot, title]);
  res.json({ id, date, slot, title });
});

// === React build を返す ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
