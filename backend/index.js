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
      title TEXT NOT NULL
    );
  `);
}
initDB();

// === API ===

// 全件取得
app.get("/api/shares", async (req, res) => {
  const result = await pool.query("SELECT * FROM shares ORDER BY date ASC");
  res.json(result.rows);
});

// 新規追加
app.post("/api/shares", async (req, res) => {
  const { date, title } = req.body;
  const id = uuidv4();

  await pool.query(
    `INSERT INTO shares (id, date, title) VALUES ($1, $2, $3)`,
    [id, date, title]
  );
  res.json({ id, date, title });
});

// 静的ファイル (React build)
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
