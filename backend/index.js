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
      range_mode TEXT NOT NULL,
      is_personal BOOLEAN DEFAULT false,
      linkid TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL,
      username TEXT NOT NULL,
      answers JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("✅ DB initialized");
}

// === APIルート ===
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// === 個人用スケジュール保存 ===
app.post("/api/personal", async (req, res) => {
  const { title, memo, dates, timeslot, range_mode } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO schedules (title, memo, dates, timeslot, range_mode, is_personal)
       VALUES ($1,$2,$3,$4,$5,true) RETURNING *`,
      [title, memo, dates, timeslot, range_mode]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ 個人スケジュール保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 共有スケジュール保存 & リンク発行 ===
app.post("/api/schedule", async (req, res) => {
  const { title, dates, timeslot, range_mode } = req.body;
  const linkid = uuidv4();

  try {
    const result = await pool.query(
      `INSERT INTO schedules (title, dates, timeslot, range_mode, is_personal, linkid)
       VALUES ($1,$2,$3,$4,false,$5) RETURNING *`,
      [title, dates, timeslot, range_mode, linkid]
    );
    res.json({ link: `/share/${linkid}`, schedule: result.rows[0] });
  } catch (err) {
    console.error("❌ 共有スケジュール保存エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === 共有リンクからスケジュール取得 ===
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
      "SELECT * FROM responses WHERE linkid = $1 ORDER BY created_at ASC",
      [linkid]
    );

    res.json({
      schedules: schedulesRes.rows,
      responses: responsesRes.rows,
    });
  } catch (err) {
    console.error("❌ スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 回答保存 ===
app.post("/api/share/:linkid/response", async (req, res) => {
  const { linkid } = req.params;
  const { username, answers } = req.body;

  try {
    await pool.query(
      `INSERT INTO responses (linkid, username, answers)
       VALUES ($1,$2,$3)`,
      [linkid, username, answers]
    );

    const responsesRes = await pool.query(
      "SELECT * FROM responses WHERE linkid = $1 ORDER BY created_at ASC",
      [linkid]
    );

    res.json(responsesRes.rows);
  } catch (err) {
    console.error("❌ 回答保存エラー:", err);
    res.status(500).json({ error: "回答保存に失敗しました" });
  }
});

// === 静的ファイル配信 ===
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));

// React Router に対応するため catch-all を index.html にリダイレクト
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
