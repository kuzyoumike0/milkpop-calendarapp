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
      dates TEXT[] NOT NULL,
      timeslot TEXT NOT NULL,
      linkid TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL,
      username TEXT NOT NULL,
      answers JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS personal_schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      dates TEXT[] NOT NULL,
      timeslot TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initDB();

// === 個人スケジュール保存 ===
app.post("/api/personal", async (req, res) => {
  const { title, memo, dates, timeslot } = req.body;
  try {
    await pool.query(
      "INSERT INTO personal_schedules (title, memo, dates, timeslot) VALUES ($1,$2,$3,$4)",
      [title, memo, dates, timeslot]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("個人スケジュール保存エラー:", err);
    res.status(500).json({ error: "保存失敗" });
  }
});

// === 個人スケジュール一覧取得 ===
app.get("/api/personal", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM personal_schedules ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("個人スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// === 共有スケジュール作成 ===
app.post("/api/schedules", async (req, res) => {
  const { title, dates, timeslot } = req.body;
  const linkid = uuidv4();
  try {
    await pool.query(
      "INSERT INTO schedules (title, dates, timeslot, linkid) VALUES ($1,$2,$3,$4)",
      [title, dates, timeslot, linkid]
    );
    res.json({ linkid });
  } catch (err) {
    console.error("共有スケジュール保存エラー:", err);
    res.status(500).json({ error: "保存失敗" });
  }
});

// === 共有スケジュール取得 ===
app.get("/api/schedule/:linkid", async (req, res) => {
  const { linkid } = req.params;
  try {
    const schedulesRes = await pool.query(
      "SELECT * FROM schedules WHERE linkid = $1",
      [linkid]
    );
    if (schedulesRes.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }
    const responsesRes = await pool.query(
      "SELECT username, answers FROM responses WHERE linkid = $1 ORDER BY created_at ASC",
      [linkid]
    );
    res.json({
      schedules: schedulesRes.rows,
      responses: responsesRes.rows,
    });
  } catch (err) {
    console.error("共有スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// === 回答保存 ===
app.post("/api/share/:linkid/response", async (req, res) => {
  const { linkid } = req.params;
  const { username, answers } = req.body;
  try {
    await pool.query(
      "INSERT INTO responses (linkid, username, answers) VALUES ($1,$2,$3)",
      [linkid, username, answers]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("回答保存エラー:", err);
    res.status(500).json({ error: "保存失敗" });
  }
});

// === 静的ファイル配信 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
