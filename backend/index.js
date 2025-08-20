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
      link_id TEXT,
      title TEXT,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      memo TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT,
      response TEXT
    );
  `);
}
initDB();

// === 日程登録（共有リンク発行） ===
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, timeslot, startTime, endTime, memo } = req.body;
    const linkId = uuidv4();

    const results = [];
    for (const d of dates) {
      const result = await pool.query(
        `INSERT INTO schedules (link_id, title, date, timeslot, start_time, end_time, memo)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [linkId, title, d, timeslot, startTime, endTime, memo || null]
      );
      results.push(result.rows[0]);
    }

    res.json({ linkId, schedules: results });
  } catch (err) {
    console.error("登録エラー:", err);
    res.status(500).json({ error: "登録に失敗しました" });
  }
});

// === 全スケジュール取得 ===
app.get("/api/shared", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM schedules ORDER BY date ASC, start_time ASC NULLS LAST"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 共有リンクから取得 ===
app.get("/api/share/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      "SELECT * FROM schedules WHERE link_id=$1 ORDER BY date ASC, start_time ASC NULLS LAST",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 共有スケジュールへのレスポンス保存 ===
app.post("/api/shared/responses", async (req, res) => {
  try {
    const { responses, dates, timeSlot, startTime, endTime } = req.body;

    // responses 保存
    for (const scheduleId in responses) {
      const resp = responses[scheduleId];
      await pool.query(
        `INSERT INTO responses (schedule_id, username, response)
         VALUES ($1,$2,$3)`,
        [scheduleId, "anonymous", resp]
      );
    }

    // 追加の日程（カレンダーで新規追加された分）も保存
    if (dates && dates.length > 0) {
      for (const d of dates) {
        await pool.query(
          `INSERT INTO schedules (title, date, timeslot, start_time, end_time, memo)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            "共有追加",
            d,
            timeSlot === "時間指定" ? `${startTime}〜${endTime}` : timeSlot,
            timeSlot === "時間指定" ? startTime : null,
            timeSlot === "時間指定" ? endTime : null,
            null,
          ]
        );
      }
    }

    res.json({ message: "保存しました" });
  } catch (err) {
    console.error("レスポンス保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 静的ファイル配信（フロントエンド） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
