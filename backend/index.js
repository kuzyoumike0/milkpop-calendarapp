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
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      linkid TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS personal_schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      id SERIAL PRIMARY KEY,
      linkid TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (schedule_id, username) -- 同じユーザー名で重複回答不可
    )
  `);
}
initDB();

// === スケジュール登録 (共有用) ===
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, timeslot, range_mode, linkid } = req.body;
    if (!title || !dates || !timeslot || !range_mode) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (title, date, timeslot, range_mode, linkid)
         VALUES ($1, $2, $3, $4, $5)`,
        [title, d, timeslot, range_mode, linkid || null]
      );
    }

    const result = await pool.query(
      `SELECT * FROM schedules ORDER BY date, timeslot`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("登録エラー:", err);
    res.status(500).json({ error: "登録に失敗しました" });
  }
});

// === スケジュール取得 (共有用) ===
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             COALESCE(json_agg(json_build_object('username', r.username, 'response', r.response))
                      FILTER (WHERE r.id IS NOT NULL), '[]') AS responses
      FROM schedules s
      LEFT JOIN share_responses r ON s.id = r.schedule_id
      GROUP BY s.id
      ORDER BY s.date, s.timeslot
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 個人スケジュール登録 ===
app.post("/api/personal", async (req, res) => {
  try {
    const { title, memo, dates, timeslot, range_mode } = req.body;
    if (!title || !dates || !timeslot || !range_mode) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    for (const d of dates) {
      await pool.query(
        `INSERT INTO personal_schedules (title, memo, date, timeslot, range_mode)
         VALUES ($1, $2, $3, $4, $5)`,
        [title, memo || "", d, timeslot, range_mode]
      );
    }

    const result = await pool.query(
      `SELECT * FROM personal_schedules ORDER BY date, timeslot`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("個人スケジュール登録エラー:", err);
    res.status(500).json({ error: "登録に失敗しました" });
  }
});

// === 個人スケジュール取得 ===
app.get("/api/personal", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM personal_schedules ORDER BY date, timeslot`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 共有リンク発行 ===
app.post("/api/share", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "タイトル必須" });

    const linkid = uuidv4();
    await pool.query(
      `INSERT INTO share_links (linkid, title) VALUES ($1, $2)`,
      [linkid, title]
    );

    res.json({ link: `/share/${linkid}` });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === 共有スケジュールへの出欠保存（同じユーザーは更新扱い） ===
app.post("/api/share-responses", async (req, res) => {
  try {
    const { username, responses } = req.body;
    if (!username || !responses) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    for (const scheduleId of Object.keys(responses)) {
      const response = responses[scheduleId];
      if (!response) continue;

      await pool.query(
        `INSERT INTO share_responses (schedule_id, username, response)
         VALUES ($1, $2, $3)
         ON CONFLICT (schedule_id, username)
         DO UPDATE SET response = EXCLUDED.response, created_at = NOW()`,
        [scheduleId, username, response]
      );
    }

    // 即時反映: レスポンス付きスケジュール一覧を返す
    const result = await pool.query(`
      SELECT s.*, 
             COALESCE(json_agg(json_build_object('username', r.username, 'response', r.response))
                      FILTER (WHERE r.id IS NOT NULL), '[]') AS responses
      FROM schedules s
      LEFT JOIN share_responses r ON s.id = r.schedule_id
      GROUP BY s.id
      ORDER BY s.date, s.timeslot
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("出欠保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 静的ファイル (Reactビルド) ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
