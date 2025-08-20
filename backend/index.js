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
      link_id TEXT NOT NULL,
      title TEXT NOT NULL,
      memo TEXT,
      dates DATE[] NOT NULL,
      timeslot TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      link_id TEXT NOT NULL,
      schedule_id INT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      response TEXT NOT NULL,
      UNIQUE(link_id, schedule_id, username)
    );
  `);
}
initDB();

// === スケジュール登録 ===
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, memo, dates, timeslot } = req.body;
    const linkId = uuidv4();

    const inserted = await pool.query(
      `INSERT INTO schedules (link_id, title, memo, dates, timeslot)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [linkId, title, memo || "", dates, timeslot]
    );

    res.json({ linkId, schedule: inserted.rows[0] });
  } catch (err) {
    console.error("スケジュール登録失敗:", err);
    res.status(500).json({ error: "スケジュール登録に失敗しました" });
  }
});

// === 共有リンクのスケジュール取得 ===
app.get("/api/share/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      `SELECT id, title, memo, unnest(dates) AS date, timeslot
       FROM schedules WHERE link_id = $1 ORDER BY date ASC`,
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("共有スケジュール取得失敗:", err);
    res.status(500).json({ error: "共有スケジュール取得に失敗しました" });
  }
});

// === 共有スケジュール回答保存 ===
app.post("/api/share/:linkId/responses", async (req, res) => {
  try {
    const { linkId } = req.params;
    const { username, responses } = req.body;

    for (const [scheduleId, response] of Object.entries(responses)) {
      await pool.query(
        `INSERT INTO responses (link_id, schedule_id, username, response)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (link_id, schedule_id, username)
         DO UPDATE SET response = $4`,
        [linkId, scheduleId, username, response]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("回答保存失敗:", err);
    res.status(500).json({ error: "回答保存に失敗しました" });
  }
});

// === 静的ファイル提供（Railway本番用） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
