const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "calendar",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      linkid TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_schedules (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL,
      username TEXT NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);
}
initDB().catch((err) => console.error("DB init error:", err));

// === API: 個人スケジュール登録 ===
app.post("/api/personal", async (req, res) => {
  try {
    const { title, memo, dates, timeslot, range_mode } = req.body;
    for (const date of dates) {
      await pool.query(
        "INSERT INTO schedules (title, memo, date, timeslot, range_mode) VALUES ($1,$2,$3,$4,$5)",
        [title, memo, date, timeslot, range_mode]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error inserting personal schedule:", err);
    res.status(500).json({ error: "Failed to save schedule" });
  }
});

// === API: スケジュール登録 & 共有リンク発行 ===
app.post("/api/schedule", async (req, res) => {
  try {
    const { title, dates, timeslot, range_mode } = req.body;
    const linkid = uuidv4();

    for (const date of dates) {
      await pool.query(
        "INSERT INTO schedules (title, date, timeslot, range_mode, linkid) VALUES ($1,$2,$3,$4,$5)",
        [title, date, timeslot, range_mode, linkid]
      );
    }
    res.json({ success: true, link: `/share/${linkid}` });
  } catch (err) {
    console.error("Error inserting schedule:", err);
    res.status(500).json({ error: "Failed to create schedule" });
  }
});

// === API: 共有スケジュール取得 ===
app.get("/api/share/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const result = await pool.query(
      "SELECT * FROM schedules WHERE linkid = $1 ORDER BY date ASC",
      [linkid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching share schedule:", err);
    res.status(500).json({ error: "Failed to fetch shared schedule" });
  }
});

// === API: 共有スケジュールに参加者登録 ===
app.post("/api/share/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const { username, selections } = req.body;

    for (const sel of selections) {
      await pool.query(
        "INSERT INTO shared_schedules (linkid, username, date, timeslot, status) VALUES ($1,$2,$3,$4,$5)",
        [linkid, username, sel.date, sel.timeslot, sel.status]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving shared schedule:", err);
    res.status(500).json({ error: "Failed to save selections" });
  }
});

// === フロントエンド配信設定 ===
const buildPath = path.join(__dirname, "public");
const indexPath = path.join(buildPath, "index.html");

if (!fs.existsSync(indexPath)) {
  console.error("❌ Frontend build not found. Check Dockerfile frontend build step.");
  process.exit(1);
}

app.use(express.static(buildPath));
app.get("*", (req, res) => {
  res.sendFile(indexPath);
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
