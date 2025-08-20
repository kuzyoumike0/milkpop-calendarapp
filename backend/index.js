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
      memo TEXT,
      dates DATE[] NOT NULL,
      timeslot TEXT NOT NULL,
      linkid TEXT UNIQUE NOT NULL,
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

// === API ===

// スケジュール作成
app.post("/api/schedule", async (req, res) => {
  try {
    const { title, memo, dates, timeslot } = req.body;
    const linkid = uuidv4();
    await pool.query(
      `INSERT INTO schedules (title, memo, dates, timeslot, linkid)
       VALUES ($1, $2, $3, $4, $5)`,
      [title, memo, dates, timeslot, linkid]
    );
    res.json({ success: true, link: `/share/${linkid}` });
  } catch (err) {
    console.error("❌ スケジュール作成エラー:", err);
    res.status(500).json({ error: "スケジュール作成に失敗しました" });
  }
});

// スケジュール取得
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
    console.error("❌ スケジュール取得エラー:", err);
    res.status(500).json({ error: "データ取得に失敗しました" });
  }
});

// 回答保存
app.post("/api/share/:linkid/response", async (req, res) => {
  try {
    const { linkid } = req.params;
    const { username, answers } = req.body;

    await pool.query(
      "INSERT INTO responses (linkid, username, answers) VALUES ($1, $2, $3)",
      [linkid, username, answers]
    );

    const updated = await pool.query(
      "SELECT username, answers FROM responses WHERE linkid = $1 ORDER BY created_at ASC",
      [linkid]
    );

    res.json({ success: true, responses: updated.rows });
  } catch (err) {
    console.error("❌ 回答保存エラー:", err);
    res.status(500).json({ error: "回答保存に失敗しました" });
  }
});

// === 静的ファイル ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバ起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
