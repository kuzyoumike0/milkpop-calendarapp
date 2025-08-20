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

// === API ===

// 📌 個人スケジュール登録
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, memo, dates, timeslot, startTime, endTime } = req.body;

    if (!dates || dates.length === 0) {
      return res.status(400).json({ error: "日付を選択してください" });
    }

    // バリデーション: 時間指定モード
    if (timeslot === "時間指定" && startTime && endTime) {
      if (startTime >= endTime) {
        return res.status(400).json({ error: "開始時刻は終了時刻より前にしてください" });
      }
    }

    for (let d of dates) {
      await pool.query(
        `INSERT INTO schedules (title, memo, date, timeslot, start_time, end_time) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [title, memo, d, timeslot, startTime, endTime]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error inserting schedule:", err);
    res.status(500).json({ error: "登録に失敗しました" });
  }
});

// 📌 共有リンク付きスケジュール登録
app.post("/api/schedules/share", async (req, res) => {
  try {
    const { title, dates, timeslot, startTime, endTime } = req.body;

    if (!dates || dates.length === 0) {
      return res.status(400).json({ error: "日付を選択してください" });
    }

    // バリデーション: 時間指定モード
    if (timeslot === "時間指定" && startTime && endTime) {
      if (startTime >= endTime) {
        return res.status(400).json({ error: "開始時刻は終了時刻より前にしてください" });
      }
    }

    const linkId = uuidv4();

    for (let d of dates) {
      await pool.query(
        `INSERT INTO schedules (link_id, title, date, timeslot, start_time, end_time) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [linkId, title, d, timeslot, startTime, endTime]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("Error inserting shared schedule:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// 📌 共有スケジュール取得
app.get("/api/shared", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM schedules WHERE link_id IS NOT NULL ORDER BY date ASC, timeslot ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// 📌 特定リンクIDのスケジュール取得
app.get("/api/shared/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      `SELECT * FROM schedules WHERE link_id = $1 ORDER BY date ASC, timeslot ASC`,
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching shared schedules:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// 📌 共有スケジュールへの回答保存
app.post("/api/shared/responses", async (req, res) => {
  try {
    const { responses } = req.body;

    for (let scheduleId in responses) {
      const response = responses[scheduleId];
      await pool.query(
        `INSERT INTO responses (schedule_id, username, response) 
         VALUES ($1, $2, $3)`,
        [scheduleId, "匿名ユーザー", response]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error saving responses:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === フロントエンド配信 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === 起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
