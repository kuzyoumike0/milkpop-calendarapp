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
      title TEXT NOT NULL,
      memo TEXT,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      range_mode TEXT NOT NULL,
      link_id TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      response TEXT NOT NULL
    );
  `);
}
initDB();

// === 個人スケジュール登録 ===
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, memo, dates, timeslot, startTime, endTime, rangeMode } = req.body;

    if (timeslot === "時間指定" && startTime >= endTime) {
      return res.status(400).json({ error: "開始時間は終了時間より前にしてください" });
    }

    const results = [];
    for (const d of dates) {
      const r = await pool.query(
        `INSERT INTO schedules (title, memo, date, timeslot, start_time, end_time, range_mode) 
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [title, memo, d, timeslot, startTime, endTime, rangeMode]
      );
      results.push(r.rows[0]);
    }

    res.json(results);
  } catch (err) {
    console.error("個人スケジュール保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 共有スケジュール登録 (リンク発行) ===
app.post("/api/schedules/share", async (req, res) => {
  try {
    const { title, dates, timeslot, startTime, endTime, rangeMode } = req.body;

    if (timeslot === "時間指定" && startTime >= endTime) {
      return res.status(400).json({ error: "開始時間は終了時間より前にしてください" });
    }

    const linkId = uuidv4();
    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (title, date, timeslot, start_time, end_time, range_mode, link_id) 
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [title, d, timeslot, startTime, endTime, rangeMode, linkId]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("共有スケジュール保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 共有スケジュール取得 ===
app.get("/api/shared/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      `SELECT * FROM schedules WHERE link_id=$1 ORDER BY date ASC`,
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("共有スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 回答保存 ===
app.post("/api/shared/responses", async (req, res) => {
  try {
    const { scheduleId, username, response } = req.body;

    await pool.query(
      `INSERT INTO responses (schedule_id, username, response) 
       VALUES ($1,$2,$3)`,
      [scheduleId, username, response]
    );

    const updated = await pool.query(
      `SELECT * FROM responses WHERE schedule_id=$1`,
      [scheduleId]
    );

    res.json(updated.rows);
  } catch (err) {
    console.error("回答保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === フロントエンド配信 ===
// 🚩 Railway で /app/backend/public に配置するように Dockerfile を修正してある前提
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// === 起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
