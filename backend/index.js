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
        ssl: { rejectUnauthorized: false },
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

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      status TEXT NOT NULL  -- "〇" or "×"
    );
  `);

  console.log("✅ init.sql でデータベースを初期化しました");
}

// === API: リンク作成 ===
app.post("/api/create-link", async (req, res) => {
  const { title, dates, timeslot, startTime, endTime } = req.body;

  if (!title || !Array.isArray(dates) || dates.length === 0) {
    return res.status(400).json({ error: "title と dates は必須です" });
  }

  try {
    const linkId = uuidv4();
    await pool.query("INSERT INTO links (id, title) VALUES ($1, $2)", [
      linkId,
      title,
    ]);

    // timeslotを決定（全日 / 昼 / 夜 / 開始-終了）
    let slotValue = "全日";
    if (timeslot === "全日" || timeslot === "昼" || timeslot === "夜") {
      slotValue = timeslot;
    } else if (startTime && endTime) {
      // 開始 < 終了チェック
      const start = parseInt(startTime, 10);
      const end = parseInt(endTime, 10);
      if (isNaN(start) || isNaN(end) || start >= end) {
        return res.status(400).json({ error: "開始時間は終了時間より前にしてください" });
      }
      slotValue = `${startTime}:00-${endTime}:00`;
    }

    for (const d of dates) {
      await pool.query(
        "INSERT INTO schedules (link_id, date, timeslot) VALUES ($1, $2, $3)",
        [linkId, d, slotValue]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成失敗" });
  }
});

// === API: 共有リンク内容取得 ===
app.get("/api/link/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const linkRes = await pool.query("SELECT * FROM links WHERE id=$1", [id]);
    if (linkRes.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }

    const schedulesRes = await pool.query(
      "SELECT * FROM schedules WHERE link_id=$1 ORDER BY date ASC",
      [id]
    );

    res.json({
      link: linkRes.rows[0],
      schedules: schedulesRes.rows,
    });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).json({ error: "リンク取得失敗" });
  }
});

// === API: 回答登録 ===
app.post("/api/respond", async (req, res) => {
  const { scheduleId, username, status } = req.body;
  if (!scheduleId || !username || !status) {
    return res.status(400).json({ error: "scheduleId, username, status は必須です" });
  }

  try {
    await pool.query(
      "INSERT INTO responses (schedule_id, username, status) VALUES ($1, $2, $3)",
      [scheduleId, username, status]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("回答登録エラー:", err);
    res.status(500).json({ error: "回答登録失敗" });
  }
});

// === API: 回答取得（回答一覧） ===
app.get("/api/responses/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.date, s.timeslot, r.username, r.status
       FROM schedules s
       LEFT JOIN responses r ON s.id = r.schedule_id
       WHERE s.link_id = $1
       ORDER BY s.date ASC`,
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("回答取得エラー:", err);
    res.status(500).json({ error: "回答取得失敗" });
  }
});

// === 静的ファイル提供（フロントエンド） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 サーバーはポート ${PORT} で実行されています`);
  });
});
