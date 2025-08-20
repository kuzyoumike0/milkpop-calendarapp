const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB接続 ===
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
      dates DATE[] NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      link_id TEXT UNIQUE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      answer TEXT NOT NULL,
      UNIQUE(schedule_id, username)
    )
  `);
}
initDB();

// === スケジュール登録 ===
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, memo, dates, timeslot, rangeMode } = req.body;
    const linkId = uuidv4();

    const result = await pool.query(
      `INSERT INTO schedules (title, memo, dates, timeslot, range_mode, link_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, memo || "", dates, timeslot, rangeMode, linkId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("スケジュール登録エラー:", err);
    res.status(500).json({ error: "登録失敗" });
  }
});

// === スケジュール取得 ===
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
        COALESCE(
          json_agg(json_build_object('username', r.username, 'answer', r.answer))
          FILTER (WHERE r.id IS NOT NULL), '[]'
        ) as responses
      FROM schedules s
      LEFT JOIN responses r ON s.id = r.schedule_id
      GROUP BY s.id
      ORDER BY MIN(s.dates)
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// === 応答登録/更新 ===
app.post("/api/responses", async (req, res) => {
  try {
    const { username, responses } = req.body;

    for (const [scheduleId, answer] of Object.entries(responses)) {
      await pool.query(
        `INSERT INTO responses (schedule_id, username, answer)
         VALUES ($1, $2, $3)
         ON CONFLICT (schedule_id, username)
         DO UPDATE SET answer = EXCLUDED.answer`,
        [scheduleId, username, answer]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("応答登録エラー:", err);
    res.status(500).json({ error: "保存失敗" });
  }
});

// === 静的ファイル (フロント) ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
