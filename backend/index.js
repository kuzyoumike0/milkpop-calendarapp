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
      "date" DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      linkid TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      linkid TEXT PRIMARY KEY,
      title TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_responses (
      id SERIAL PRIMARY KEY,
      schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      response TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_share_responses_unique
    ON share_responses(schedule_id, username);
  `);
}
initDB();

// === 個人スケジュール登録 ===
app.post("/api/personal-schedules", async (req, res) => {
  try {
    const { title, memo, dates, timeslot, range_mode } = req.body;
    if (!title || !dates || !timeslot || !range_mode) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (title, memo, "date", timeslot, range_mode, linkid)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [title, memo || "", d, timeslot, range_mode, "personal"]
      );
    }

    const result = await pool.query(`
      SELECT id, title, memo, "date", timeslot, range_mode
      FROM schedules
      WHERE linkid = 'personal'
      ORDER BY "date", timeslot
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("個人登録エラー:", err);
    res.status(500).json({ error: "登録に失敗しました" });
  }
});

// === 個人スケジュール取得 ===
app.get("/api/personal-schedules", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, memo, "date", timeslot, range_mode
      FROM schedules
      WHERE linkid = 'personal'
      ORDER BY "date", timeslot
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("個人取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === スケジュール登録 (共有用) ===
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, timeslot, range_mode, linkid } = req.body;
    if (!title || !dates || !timeslot || !range_mode) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    const useLinkId = linkid || uuidv4();

    // share_links 登録
    await pool.query(
      `INSERT INTO share_links (linkid, title)
       VALUES ($1, $2)
       ON CONFLICT (linkid) DO NOTHING`,
      [useLinkId, title]
    );

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (title, "date", timeslot, range_mode, linkid)
         VALUES ($1, $2, $3, $4, $5)`,
        [title, d, timeslot, range_mode, useLinkId]
      );
    }

    const result = await pool.query(`
      SELECT s.id, s.title, s."date", s.timeslot, s.range_mode, s.linkid, l.title AS link_title
      FROM schedules s
      LEFT JOIN share_links l ON s.linkid = l.linkid
      ORDER BY s."date", s.timeslot
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("共有登録エラー:", err);
    res.status(500).json({ error: "登録に失敗しました" });
  }
});

// === スケジュール取得 (共有用) ===
app.get("/api/schedules", async (req, res) => {
  try {
    const { linkid } = req.query;

    let query = `
      SELECT s.id, s.title, s."date", s.timeslot, s.range_mode, s.linkid, l.title AS link_title,
             COALESCE(json_agg(json_build_object('username', r.username, 'response', r.response))
                      FILTER (WHERE r.id IS NOT NULL), '[]') AS responses
      FROM schedules s
      LEFT JOIN share_responses r ON s.id = r.schedule_id
      LEFT JOIN share_links l ON s.linkid = l.linkid
    `;
    const params = [];

    if (linkid) {
      query += ` WHERE s.linkid = $1`;
      params.push(linkid);
    }

    query += ` GROUP BY s.id, l.title ORDER BY s."date", s.timeslot`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 出欠保存 ===
app.post("/api/share-responses", async (req, res) => {
  try {
    const { username, responses } = req.body;
    if (!username || !responses) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    for (const scheduleId of Object.keys(responses)) {
      const response = responses[scheduleId];
      await pool.query(
        `INSERT INTO share_responses (schedule_id, username, response)
         VALUES ($1, $2, $3)
         ON CONFLICT (schedule_id, username)
         DO UPDATE SET response = EXCLUDED.response`,
        [scheduleId, username, response]
      );
    }

    const result = await pool.query(`
      SELECT s.id, s.title, s."date", s.timeslot, s.range_mode, s.linkid, l.title AS link_title,
             COALESCE(json_agg(json_build_object('username', r.username, 'response', r.response))
                      FILTER (WHERE r.id IS NOT NULL), '[]') AS responses
      FROM schedules s
      LEFT JOIN share_responses r ON s.id = r.schedule_id
      LEFT JOIN share_links l ON s.linkid = l.linkid
      GROUP BY s.id, l.title
      ORDER BY s."date", s.timeslot
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 静的ファイル配信（本番用） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
