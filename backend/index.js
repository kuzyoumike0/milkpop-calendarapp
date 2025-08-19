const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();   // ← ここで最初にappを定義
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
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      linkid TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      response TEXT NOT NULL
    );
  `);
}
initDB();

// === スケジュール登録 ===
app.post("/api/schedule", async (req, res) => {
  try {
    const { title, start_date, end_date, timeslot, range_mode, dates } = req.body;
    const linkid = uuidv4();

    if (!title || !start_date || !end_date) {
      return res.status(400).json({ success: false, error: "必須項目が未入力です" });
    }

    if (range_mode === "複数選択" && Array.isArray(dates) && dates.length > 0) {
      // 複数日 → 日ごとに保存
      const inserted = [];
      for (const d of dates) {
        const result = await pool.query(
          `INSERT INTO schedules (title, memo, start_date, end_date, timeslot, range_mode, linkid)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          [title, null, d, d, timeslot, range_mode, linkid]
        );
        inserted.push(result.rows[0]);
      }
      return res.json({ success: true, schedules: inserted, url: `/share/${linkid}` });
    } else {
      // 範囲選択
      const result = await pool.query(
        `INSERT INTO schedules (title, memo, start_date, end_date, timeslot, range_mode, linkid)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [title, null, start_date, end_date, timeslot, range_mode, linkid]
      );
      return res.json({ success: true, schedule: result.rows[0], url: `/share/${linkid}` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "登録失敗" });
  }
});

// === スケジュール一覧 ===
app.get("/api/schedules", async (req, res) => {
  const result = await pool.query("SELECT * FROM schedules ORDER BY start_date ASC");
  res.json(result.rows);
});

// === 共有リンクから取得 ===
app.get("/api/share/:linkid", async (req, res) => {
  const { linkid } = req.params;
  const result = await pool.query("SELECT * FROM schedules WHERE linkid=$1 ORDER BY start_date ASC", [linkid]);
  res.json(result.rows);
});

// === 参加者レスポンス保存 ===
app.post("/api/response", async (req, res) => {
  const { schedule_id, username, response } = req.body;
  await pool.query(
    "INSERT INTO responses (schedule_id, username, response) VALUES ($1,$2,$3)",
    [schedule_id, username, response]
  );
  res.json({ success: true });
});

// === 参加者レスポンス取得 ===
app.get("/api/responses/:schedule_id", async (req, res) => {
  const { schedule_id } = req.params;
  const result = await pool.query("SELECT * FROM responses WHERE schedule_id=$1", [schedule_id]);
  res.json(result.rows);
});

// === フロントエンド提供 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
