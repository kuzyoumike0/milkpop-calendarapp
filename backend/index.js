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
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      linkid UUID NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS personal_schedules (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      schedule_id INT NOT NULL,
      response TEXT NOT NULL
    );
  `);
}
initDB();

// === API: 日程登録（共有用） ===
app.post("/api/schedule", async (req, res) => {
  try {
    const { title, start_date, end_date, timeslot, range_mode } = req.body;
    if (!title || !start_date || !end_date || !timeslot || !range_mode) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    const linkid = uuidv4();
    await pool.query(
      `INSERT INTO schedules (title, start_date, end_date, timeslot, range_mode, linkid)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [title, start_date, end_date, timeslot, range_mode, linkid]
    );
    res.json({ link: `/share/${linkid}` });
  } catch (err) {
    console.error("日程登録エラー:", err);
    res.status(500).json({ error: "日程登録失敗" });
  }
});

// === API: 個人スケジュール登録 ===
app.post("/api/personal", async (req, res) => {
  try {
    const { username, start_date, end_date, timeslot, range_mode } = req.body;
    if (!username || !start_date || !end_date || !timeslot || !range_mode) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    await pool.query(
      `INSERT INTO personal_schedules (username, start_date, end_date, timeslot, range_mode)
       VALUES ($1,$2,$3,$4,$5)`,
      [username, start_date, end_date, timeslot, range_mode]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("個人スケジュール登録エラー:", err);
    res.status(500).json({ error: "登録失敗" });
  }
});

// === API: 共有リンクで日程取得 ===
app.get("/api/share/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const result = await pool.query(
      `SELECT * FROM schedules WHERE linkid = $1`,
      [linkid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("共有リンク取得エラー:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// === API: 応答保存（〇✖） ===
app.post("/api/response", async (req, res) => {
  try {
    const { username, schedule_id, response } = req.body;
    if (!username || !schedule_id || !response) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    await pool.query(
      `INSERT INTO responses (username, schedule_id, response)
       VALUES ($1,$2,$3)`,
      [username, schedule_id, response]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("応答保存エラー:", err);
    res.status(500).json({ error: "保存失敗" });
  }
});

// === 静的ファイル提供 ===
// Dockerfileで build → backend/public にコピーしてあるのでこちらを見る
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
