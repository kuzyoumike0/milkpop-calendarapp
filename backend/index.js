const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
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
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      linkid TEXT UNIQUE NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS votes (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL,
      username TEXT NOT NULL,
      votes JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initDB();

// === スケジュール登録 ===
app.post("/api/schedule", async (req, res) => {
  const { title, start_date, end_date, timeslot, range_mode } = req.body;
  const linkid = uuidv4();

  try {
    await pool.query(
      `INSERT INTO schedules (title, start_date, end_date, timeslot, range_mode, linkid)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, start_date, end_date, timeslot, range_mode, linkid]
    );
    res.json({ link: `/share/${linkid}` });
  } catch (err) {
    console.error("スケジュール登録エラー:", err);
    res.status(500).json({ error: "登録に失敗しました" });
  }
});

// === スケジュール取得 + 投票一覧 ===
app.get("/api/schedule/:linkid", async (req, res) => {
  const { linkid } = req.params;
  try {
    const scheduleRes = await pool.query(
      `SELECT * FROM schedules WHERE linkid = $1`,
      [linkid]
    );
    const schedule = scheduleRes.rows[0];
    if (!schedule) return res.status(404).json({ error: "スケジュールが見つかりません" });

    const votesRes = await pool.query(
      `SELECT username, votes FROM votes WHERE linkid = $1 ORDER BY id ASC`,
      [linkid]
    );

    const records = votesRes.rows.map((r) => ({
      username: r.username,
      votes: r.votes,
    }));

    res.json({ schedule, records });
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 投票保存 ===
app.post("/api/vote/:linkid", async (req, res) => {
  const { linkid } = req.params;
  const { username, votes } = req.body;

  try {
    await pool.query(
      `INSERT INTO votes (linkid, username, votes)
       VALUES ($1, $2, $3)`,
      [linkid, username, votes]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("投票保存エラー:", err);
    res.status(500).json({ error: "投票保存に失敗しました" });
  }
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});
