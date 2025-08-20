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
    CREATE TABLE IF NOT EXISTS personal_schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      linkid TEXT NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL,
      username TEXT NOT NULL,
      answers JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ DB initialized");
}
initDB();

// === 個人スケジュール登録 ===
app.post("/api/personal-schedule", async (req, res) => {
  const { title, memo, dates, timeslot } = req.body;
  try {
    for (const d of dates) {
      await pool.query(
        "INSERT INTO personal_schedules (title, memo, date, timeslot) VALUES ($1,$2,$3,$4)",
        [title, memo, d, timeslot]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("個人スケジュール登録エラー:", err);
    res.status(500).json({ error: "DB保存に失敗しました" });
  }
});

// === 個人スケジュール取得 ===
app.get("/api/personal-schedule", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM personal_schedules ORDER BY date ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("個人スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 共有スケジュール登録 ===
app.post("/api/schedule", async (req, res) => {
  const { title, dates, timeslot } = req.body;
  const linkid = uuidv4();
  try {
    for (const d of dates) {
      await pool.query(
        "INSERT INTO schedules (title, linkid, date, timeslot) VALUES ($1,$2,$3,$4)",
        [title, linkid, d, timeslot]
      );
    }
    res.json({ success: true, link: `/share/${linkid}` });
  } catch (err) {
    console.error("共有スケジュール登録エラー:", err);
    res.status(500).json({ error: "DB保存に失敗しました" });
  }
});

// === 共有スケジュール取得 ===
app.get("/api/schedule/:linkid", async (req, res) => {
  const { linkid } = req.params;
  try {
    const schedulesRes = await pool.query(
      "SELECT * FROM schedules WHERE linkid=$1 ORDER BY date ASC",
      [linkid]
    );
    const responsesRes = await pool.query(
      "SELECT username, answers FROM responses WHERE linkid=$1 ORDER BY created_at ASC",
      [linkid]
    );
    res.json({
      schedules: schedulesRes.rows,
      responses: responsesRes.rows,
    });
  } catch (err) {
    console.error("共有スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 共有スケジュールへの回答 ===
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
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 静的ファイル提供 (Railway用) ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
