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
      linkId TEXT NOT NULL,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      range_mode TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      scheduleId INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB();

// === 個人スケジュール保存 ===
app.post("/api/schedules/personal", async (req, res) => {
  try {
    const { title, memo, dates, timeslot, startTime, endTime, rangeMode } =
      req.body;

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (linkId, title, date, timeslot, start_time, end_time, range_mode) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), title, d, timeslot, startTime, endTime, rangeMode]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ 個人スケジュール保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 共有スケジュール保存 & リンク発行 ===
app.post("/api/schedules/share", async (req, res) => {
  try {
    const { title, dates, timeslot, startTime, endTime, rangeMode } = req.body;
    const linkId = uuidv4();

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (linkId, title, date, timeslot, start_time, end_time, range_mode) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [linkId, title, d, timeslot, startTime, endTime, rangeMode]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("❌ 共有スケジュール保存エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === 共有ページのデータ取得 ===
app.get("/api/schedules/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const schedules = await pool.query(
      "SELECT * FROM schedules WHERE linkId=$1 ORDER BY date ASC",
      [linkId]
    );
    const responses = await pool.query(
      "SELECT * FROM responses WHERE scheduleId IN (SELECT id FROM schedules WHERE linkId=$1)",
      [linkId]
    );

    res.json({
      schedules: schedules.rows,
      responses: responses.rows,
    });
  } catch (err) {
    console.error("❌ データ取得エラー:", err);
    res.status(500).json({ error: "データ取得に失敗しました" });
  }
});

// === 共有スケジュールへの回答保存 ===
app.post("/api/schedules/:linkId/respond", async (req, res) => {
  try {
    const { linkId } = req.params;
    const { username, dates } = req.body;

    const scheduleRows = await pool.query(
      "SELECT * FROM schedules WHERE linkId=$1",
      [linkId]
    );

    for (const d of dates) {
      const schedule = scheduleRows.rows.find((s) => s.date.toISOString().split("T")[0] === d);
      if (schedule) {
        await pool.query(
          `INSERT INTO responses (scheduleId, username, response) 
           VALUES ($1, $2, $3)`,
          [schedule.id, username, "〇"]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ 回答保存エラー:", err);
    res.status(500).json({ error: "回答保存に失敗しました" });
  }
});

// === フロントのビルド配信 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
