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
      linkid TEXT UNIQUE NOT NULL,
      start_time TEXT,
      end_time TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL REFERENCES schedules(linkid) ON DELETE CASCADE,
      username TEXT NOT NULL,
      answers JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB().catch((err) => console.error("DB初期化失敗:", err));

// === スケジュール登録（共有リンク発行） ===
app.post("/api/schedules", async (req, res) => {
  const { title, dates, start_time, end_time } = req.body;
  if (!title || !dates || dates.length === 0) {
    return res.status(400).json({ error: "タイトルと日程は必須です" });
  }

  // 開始時刻と終了時刻の整合性チェック
  if (start_time && end_time) {
    const s = parseInt(start_time, 10);
    const e = parseInt(end_time, 10);
    if (!isNaN(s) && !isNaN(e) && s >= e) {
      return res.status(400).json({ error: "終了時刻は開始時刻より後にしてください" });
    }
  }

  const linkid = uuidv4();
  try {
    await pool.query(
      `INSERT INTO schedules (title, dates, linkid, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)`,
      [title, dates, linkid, start_time || null, end_time || null]
    );
    res.json({ linkid });
  } catch (err) {
    console.error("共有リンク発行失敗:", err);
    res.status(500).json({ error: "共有リンク発行に失敗しました" });
  }
});

// === スケジュール取得 ===
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
    console.error("スケジュール取得失敗:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// === 回答保存 ===
app.post("/api/share/:linkid/response", async (req, res) => {
  const { linkid } = req.params;
  const { username, answers } = req.body;

  if (!username || !answers) {
    return res.status(400).json({ error: "名前と回答は必須です" });
  }

  try {
    await pool.query(
      `INSERT INTO responses (linkid, username, answers)
       VALUES ($1, $2, $3)`,
      [linkid, username, answers]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("回答登録失敗:", err);
    res.status(500).json({ error: "回答登録に失敗しました" });
  }
});

// === フロントエンドを提供 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ サーバー起動: http://localhost:${PORT}`);
});
