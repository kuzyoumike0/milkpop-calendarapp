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
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      linkid TEXT,
      link_title TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      response TEXT NOT NULL,
      UNIQUE(schedule_id, username)
    )
  `);
}
initDB();

// === スケジュール登録（個人・共有共通） ===
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, memo, dates, timeslot, range_mode, linkid, link_title } =
      req.body;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: "日付が必要です" });
    }

    const results = [];
    for (const d of dates) {
      const result = await pool.query(
        `INSERT INTO schedules (title, memo, date, timeslot, range_mode, linkid, link_title)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [title, memo || null, d, timeslot, range_mode, linkid || null, link_title || null]
      );
      results.push(result.rows[0]);
    }

    res.json(results);
  } catch (err) {
    console.error("スケジュール登録エラー:", err);
    res.status(500).json({ error: "スケジュール登録に失敗しました" });
  }
});

// === スケジュール取得（linkidごとに絞り込み） ===
app.get("/api/schedules", async (req, res) => {
  try {
    const { linkid } = req.query;

    let query = `
      SELECT s.*, COALESCE(json_agg(r.*) FILTER (WHERE r.id IS NOT NULL), '[]') AS responses
      FROM schedules s
      LEFT JOIN responses r ON s.id = r.schedule_id
    `;
    const params = [];

    if (linkid) {
      query += ` WHERE s.linkid = $1`;
      params.push(linkid);
    }

    query += ` GROUP BY s.id ORDER BY s.date ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("スケジュール取得エラー:", err);
    res.status(500).json({ error: "スケジュール取得に失敗しました" });
  }
});

// === 個別共有リンク用スケジュール取得 ===
app.get("/api/share/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const result = await pool.query(
      `
      SELECT s.*, COALESCE(json_agg(r.*) FILTER (WHERE r.id IS NOT NULL), '[]') AS responses
      FROM schedules s
      LEFT JOIN responses r ON s.id = r.schedule_id
      WHERE s.linkid = $1
      GROUP BY s.id, s.link_title
      ORDER BY s.date ASC
      `,
      [linkid]
    );

    res.json({
      link_title: result.rows.length > 0 ? result.rows[0].link_title : "",
      schedules: result.rows,
    });
  } catch (err) {
    console.error("共有スケジュール取得エラー:", err);
    res.status(500).json({ error: "共有スケジュール取得に失敗しました" });
  }
});

// === 回答保存（即時反映、同じユーザー名なら更新扱い） ===
app.post("/api/share-responses", async (req, res) => {
  try {
    const responses = req.body; // [{ schedule_id, username, response }]
    for (const r of responses) {
      await pool.query(
        `
        INSERT INTO responses (schedule_id, username, response)
        VALUES ($1, $2, $3)
        ON CONFLICT (schedule_id, username)
        DO UPDATE SET response = EXCLUDED.response
        `,
        [r.schedule_id, r.username, r.response]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("回答保存エラー:", err);
    res.status(500).json({ error: "回答保存に失敗しました" });
  }
});

// === 静的ファイル配信（フロントエンドビルド済み） ===
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === サーバ起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
