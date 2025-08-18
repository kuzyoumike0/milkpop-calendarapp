const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// === PostgreSQL 接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "calendar",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      }
);

// === 初期化（テーブル作成） ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      title TEXT NOT NULL,
      username TEXT,
      timeslot TEXT,
      start_time TEXT,
      end_time TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      id SERIAL PRIMARY KEY,
      share_id TEXT UNIQUE NOT NULL,
      date DATE NOT NULL
    );
  `);
}
initDB();

// === API ===

// 予定追加
app.post("/api/add", async (req, res) => {
  try {
    const { date, title, username, timeslot, startTime, endTime } = req.body;
    await pool.query(
      `INSERT INTO schedules (date, title, username, timeslot, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [date, title, username, timeslot, startTime, endTime]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error inserting schedule:", err);
    res.status(500).json({ error: "DB insert failed" });
  }
});

// 日付ごとの予定取得
app.get("/api/schedules", async (req, res) => {
  try {
    const { date } = req.query;
    const result = await pool.query(
      `SELECT * FROM schedules WHERE date = $1 ORDER BY 
        CASE 
          WHEN start_time IS NOT NULL THEN start_time 
          ELSE timeslot 
        END ASC`,
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching schedules:", err);
    res.status(500).json({ error: "DB fetch failed" });
  }
});

// 共有リンクを発行
app.post("/api/share", async (req, res) => {
  try {
    const { date } = req.body;
    const shareId = uuidv4();
    await pool.query(
      `INSERT INTO share_links (share_id, date) VALUES ($1, $2)`,
      [shareId, date]
    );
    res.json({ shareId });
  } catch (err) {
    console.error("❌ Error creating share link:", err);
    res.status(500).json({ error: "DB insert failed" });
  }
});

// 共有リンクから予定取得
app.get("/api/share/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;
    const linkRes = await pool.query(
      `SELECT date FROM share_links WHERE share_id = $1`,
      [shareId]
    );
    if (linkRes.rows.length === 0) {
      return res.status(404).json({ error: "Link not found" });
    }
    const date = linkRes.rows[0].date;
    const schedulesRes = await pool.query(
      `SELECT * FROM schedules WHERE date = $1 ORDER BY 
        CASE 
          WHEN start_time IS NOT NULL THEN start_time 
          ELSE timeslot 
        END ASC`,
      [date]
    );
    res.json({ date, schedules: schedulesRes.rows });
  } catch (err) {
    console.error("❌ Error fetching share link schedules:", err);
    res.status(500).json({ error: "DB fetch failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
