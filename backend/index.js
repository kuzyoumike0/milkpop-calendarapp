// backend/index.js
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// === PostgreSQL 接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkId UUID NOT NULL,
      title TEXT,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      startTime TEXT,
      endTime TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id UUID NOT NULL,
      linkId UUID NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      username TEXT NOT NULL,
      choice TEXT NOT NULL,
      UNIQUE (schedule_id, username)
    );
  `);
}

initDB().then(() => console.log("✅ DB初期化完了")).catch(console.error);

// === 新しい共有リンク作成 ===
app.post("/api/create-link", async (req, res) => {
  try {
    const { title, schedules } = req.body;
    const linkId = uuidv4();

    for (const s of schedules) {
      await pool.query(
        `INSERT INTO schedules (linkId, title, date, timeslot, startTime, endTime)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [linkId, title, s.date, s.timeslot, s.startTime, s.endTime]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === 共有リンクデータ取得 ===
app.get("/api/link/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    const schedulesRes = await pool.query(
      "SELECT * FROM schedules WHERE linkId=$1 ORDER BY date ASC",
      [linkId]
    );

    const responsesRes = await pool.query(
      "SELECT * FROM responses WHERE linkId=$1",
      [linkId]
    );

    res.json({
      title: schedulesRes.rows.length > 0 ? schedulesRes.rows[0].title : "",
      schedules: schedulesRes.rows,
      responses: responsesRes.rows,
    });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).json({ error: "リンク取得に失敗しました" });
  }
});

// === 回答送信 ===
app.post("/api/respond", async (req, res) => {
  try {
    const { schedule_id, linkId, date, timeslot, username, choice } = req.body;

    await pool.query(
      `INSERT INTO responses (schedule_id, linkId, date, timeslot, username, choice)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (schedule_id, username)
       DO UPDATE SET choice = EXCLUDED.choice`,
      [schedule_id, linkId, date, timeslot, username, choice]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("参加者追加エラー:", err);
    res.status(500).json({ error: "参加者追加に失敗しました" });
  }
});

// === 回答削除 ===
app.post("/api/delete-response", async (req, res) => {
  try {
    const { schedule_id, username } = req.body;

    await pool.query(
      "DELETE FROM responses WHERE schedule_id=$1 AND username=$2",
      [schedule_id, username]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("削除エラー:", err);
    res.status(500).json({ error: "回答削除に失敗しました" });
  }
});

// === 静的ファイル提供 (フロント React ビルド) ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 サーバーはポート${PORT}で実行されています`));
