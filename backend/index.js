const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// ===== DB 接続設定 =====
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

// ===== DB 初期化 =====
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      link_id TEXT NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      starttime TEXT,
      endtime TEXT,
      FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      link_id TEXT NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      username TEXT NOT NULL,
      choice TEXT NOT NULL CHECK (choice IN ('◯','×')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
    );
  `);
  console.log("✅ DB 初期化完了");
}
initDB().catch(console.error);

// ===== 共有リンク作成 =====
app.post("/api/create-link", async (req, res) => {
  const { title, dates, timeslot, startTime, endTime } = req.body;
  if (!title || !dates || dates.length === 0) {
    return res.status(400).json({ error: "タイトルと日付が必要です" });
  }

  try {
    const linkId = uuidv4();
    await pool.query(`INSERT INTO links (id, title) VALUES ($1, $2)`, [
      linkId,
      title,
    ]);

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (link_id, date, timeslot, starttime, endtime)
         VALUES ($1, $2, $3, $4, $5)`,
        [linkId, d, timeslot, startTime, endTime]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// ===== リンク取得 =====
app.get("/api/link/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const linkResult = await pool.query(
      `SELECT * FROM links WHERE id = $1`,
      [linkId]
    );

    if (linkResult.rows.length === 0) {
      return res.status(404).json({ error: "リンクが見つかりません" });
    }

    const schedulesResult = await pool.query(
      `SELECT date, timeslot, starttime, endtime 
       FROM schedules 
       WHERE link_id = $1 
       ORDER BY date ASC`,
      [linkId]
    );

    const responsesResult = await pool.query(
      `SELECT username, date, timeslot, choice
       FROM responses
       WHERE link_id = $1`,
      [linkId]
    );

    res.json({
      title: linkResult.rows[0].title,
      schedules: schedulesResult.rows || [],
      responses: responsesResult.rows || [],
    });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// ===== 回答登録 =====
app.post("/api/respond", async (req, res) => {
  const { linkId, date, timeslot, username, choice } = req.body;
  if (!linkId || !date || !timeslot || !username || !choice) {
    return res.status(400).json({ error: "全ての項目が必須です" });
  }

  try {
    await pool.query(
      `INSERT INTO responses (link_id, date, timeslot, username, choice)
       VALUES ($1, $2, $3, $4, $5)`,
      [linkId, date, timeslot, username, choice]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("回答保存エラー:", err);
    res.status(500).json({ error: "回答保存に失敗しました" });
  }
});

// ===== 静的ファイル (React) =====
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 サーバーはポート ${PORT} で実行されています`);
});
