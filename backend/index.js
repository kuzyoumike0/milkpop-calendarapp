const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
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
      linkid TEXT NOT NULL,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      range_mode TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      scheduleId INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Database initialized");
}
initDB();

// === API ===

// 共有スケジュール作成
app.post("/api/schedules/share", async (req, res) => {
  try {
    const { title, dates, timeslot, startTime, endTime, rangeMode } = req.body;
    const linkId = uuidv4();

    if (!title || !dates || dates.length === 0) {
      return res.status(400).json({ error: "タイトルと日程は必須です" });
    }

    const results = [];
    for (const d of dates) {
      const result = await pool.query(
        `INSERT INTO schedules (linkid, title, date, timeslot, start_time, end_time, range_mode)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [linkId, title, d, timeslot, startTime, endTime, rangeMode]
      );
      results.push(result.rows[0]);
    }

    res.json({ linkId, schedules: results });
  } catch (err) {
    console.error("共有リンク作成エラー:", err);
    res.status(500).json({ error: "共有リンク作成に失敗しました" });
  }
});

// 共有スケジュール取得
app.get("/api/schedules/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      "SELECT * FROM schedules WHERE linkid = $1 ORDER BY date ASC",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// レスポンス保存
app.post("/api/responses", async (req, res) => {
  try {
    const { scheduleId, username, response } = req.body;
    const result = await pool.query(
      `INSERT INTO responses (scheduleId, username, response)
       VALUES ($1, $2, $3) RETURNING *`,
      [scheduleId, username, response]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("レスポンス保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// レスポンス取得
app.get("/api/responses/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      `SELECT r.id, r.username, r.response, s.date, s.timeslot
       FROM responses r
       JOIN schedules s ON r.scheduleId = s.id
       WHERE s.linkid = $1
       ORDER BY s.date ASC`,
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("レスポンス取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 静的ファイル (Reactビルド) ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバ起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
