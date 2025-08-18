const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// ====== ミドルウェア ======
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ====== PostgreSQL 接続 ======
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@db:5432/mydb",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ====== DB初期化 ======
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      time_slot TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      id SERIAL PRIMARY KEY,
      share_id TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB();

// ====== API ======

// ✅ 個人スケジュール追加
app.post("/api/schedules", async (req, res) => {
  try {
    const { username, title, date, time_slot } = req.body;
    await pool.query(
      "INSERT INTO schedules (username, title, date, time_slot) VALUES ($1, $2, $3, $4)",
      [username, title, date, time_slot]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error inserting schedule:", err);
    res.status(500).json({ error: "Failed to insert schedule" });
  }
});

// ✅ 個人スケジュール取得
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules ORDER BY date ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// ✅ 共有リンク発行
app.post("/api/share", async (req, res) => {
  try {
    const shareId = uuidv4();
    await pool.query("INSERT INTO share_links (share_id) VALUES ($1)", [shareId]);
    res.json({ shareId });
  } catch (err) {
    console.error("Error creating share link:", err);
    res.status(500).json({ error: "Failed to create share link" });
  }
});

// ✅ 共有リンクからスケジュール取得
app.get("/api/share/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;
    const linkResult = await pool.query("SELECT * FROM share_links WHERE share_id = $1", [shareId]);

    if (linkResult.rows.length === 0) {
      return res.status(404).json({ error: "Invalid share link" });
    }

    const schedules = await pool.query("SELECT * FROM schedules ORDER BY date ASC");
    res.json(schedules.rows);
  } catch (err) {
    console.error("Error fetching shared schedules:", err);
    res.status(500).json({ error: "Failed to fetch shared schedules" });
  }
});

// ====== サーバー起動 ======
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
