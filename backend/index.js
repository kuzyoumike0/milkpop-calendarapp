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
      dates TEXT[] NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      linkid TEXT,
      is_personal BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL,
      username TEXT NOT NULL,
      answers JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}
initDB();

// === スケジュール登録 API ===
app.post("/api/schedules", async (req, res) => {
  const { title, memo, dates, timeslot, range_mode, is_personal } = req.body;

  try {
    let linkid = null;

    if (!is_personal) {
      // 共有用 → リンク発行
      linkid = uuidv4();
    }

    await pool.query(
      `INSERT INTO schedules (title, memo, dates, timeslot, range_mode, linkid, is_personal)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [title, memo, dates, timeslot, range_mode, linkid, is_personal]
    );

    if (is_personal) {
      res.json({ success: true, message: "個人スケジュールを保存しました" });
    } else {
      res.json({ success: true, linkid });
    }
  } catch (err) {
    console.error("スケジュール登録エラー:", err);
    res.status(500).json({ error: "スケジュール登録に失敗しました" });
  }
});

// === 共有スケジュール取得 API ===
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
    console.error("スケジュール取得エラー:", err);
    res.status(500).json({ error: "スケジュール取得に失敗しました" });
  }
});

// === 回答保存 API ===
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
    res.status(500).json({ error: "回答保存に失敗しました" });
  }
});

// === 静的ファイル配信（Railway用） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバ起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
