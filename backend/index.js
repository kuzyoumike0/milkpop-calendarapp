// backend/index.js
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// === PostgreSQL 接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// === DB初期化関数 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      id SERIAL PRIMARY KEY,
      linkid TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL REFERENCES share_links(linkid) ON DELETE CASCADE,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      starttime TEXT,
      endtime TEXT
    );

    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      response TEXT NOT NULL  -- ○ or ✖
    );
  `);
  console.log("✅ DB初期化完了");
}

// === API: 共有リンク作成 ===
app.post("/api/create-link", async (req, res) => {
  const { title, dates, timeslot, startTime, endTime } = req.body;
  const linkId = uuidv4();

  try {
    await pool.query("BEGIN");

    // 共有リンク情報を保存
    await pool.query(
      "INSERT INTO share_links (linkid, title) VALUES ($1, $2)",
      [linkId, title]
    );

    // 日付ごとにスケジュールを保存
    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (linkid, date, timeslot, starttime, endtime)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          linkId,
          d, // ← "2025-08-19" のような文字列
          timeslot,
          timeslot === "custom" ? startTime : null,
          timeslot === "custom" ? endTime : null,
        ]
      );
    }

    await pool.query("COMMIT");

    res.json({ linkId });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成失敗" });
  }
});

// === API: 共有リンク取得 ===
app.get("/api/link/:linkId", async (req, res) => {
  const { linkId } = req.params;

  try {
    const schedulesRes = await pool.query(
      "SELECT * FROM schedules WHERE linkid=$1 ORDER BY date ASC",
      [linkId]
    );
    const schedules = schedulesRes.rows;

    res.json({ schedules });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).json({ error: "リンク取得失敗" });
  }
});

// === API: 出欠登録 ===
app.post("/api/respond", async (req, res) => {
  const { scheduleId, username, response } = req.body;

  try {
    await pool.query(
      "INSERT INTO responses (schedule_id, username, response) VALUES ($1, $2, $3)",
      [scheduleId, username, response]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("出欠登録エラー:", err);
    res.status(500).json({ error: "出欠登録失敗" });
  }
});

// === API: 出欠取得 ===
app.get("/api/responses/:scheduleId", async (req, res) => {
  const { scheduleId } = req.params;

  try {
    const responsesRes = await pool.query(
      "SELECT * FROM responses WHERE schedule_id=$1",
      [scheduleId]
    );
    res.json({ responses: responsesRes.rows });
  } catch (err) {
    console.error("出欠取得エラー:", err);
    res.status(500).json({ error: "出欠取得失敗" });
  }
});

// === Reactルーティング対応 ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// サーバー起動
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀サーバーはポート${PORT}で実行されています`);
  });
});
