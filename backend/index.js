const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// === PostgreSQL 接続設定 ===
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

// === DB初期化 ===
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        linkid TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        linkid TEXT REFERENCES links(linkid) ON DELETE CASCADE,
        date DATE NOT NULL,
        timeslot TEXT NOT NULL,
        starttime TEXT,
        endtime TEXT
      );

      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        scheduleid INT REFERENCES schedules(id) ON DELETE CASCADE,
        username TEXT NOT NULL,
        status TEXT NOT NULL
      );
    `);
    console.log("✅ init.sql でデータベースを初期化しました");
  } finally {
    client.release();
  }
}
initDB();

// === リンク作成 API ===
app.post("/api/create-link", async (req, res) => {
  try {
    const { title, dates } = req.body;
    if (!title || !dates || dates.length === 0) {
      return res.status(400).json({ error: "タイトルと日程は必須です" });
    }

    const client = await pool.connect();
    const linkId = uuidv4(); // ✅ 毎回ユニーク

    // links に挿入
    await client.query(
      "INSERT INTO links (linkid, title) VALUES ($1, $2)",
      [linkId, title]
    );

    // schedules に日程を挿入
    for (const d of dates) {
      if (d.startTime && d.endTime && d.startTime >= d.endTime) {
        throw new Error("開始時間は終了時間より前にしてください");
      }

      await client.query(
        "INSERT INTO schedules (linkid, date, timeslot, starttime, endtime) VALUES ($1, $2, $3, $4, $5)",
        [linkId, d.date, d.timeslot, d.startTime || null, d.endTime || null]
      );
    }

    client.release();
    res.json({ linkId });
  } catch (err) {
    console.error("❌ リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === リンク詳細取得 API ===
app.get("/api/link/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const client = await pool.connect();

    const linkResult = await client.query(
      "SELECT * FROM links WHERE linkid=$1",
      [linkId]
    );
    if (linkResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: "リンクが見つかりません" });
    }

    const schedulesResult = await client.query(
      "SELECT * FROM schedules WHERE linkid=$1 ORDER BY date ASC",
      [linkId]
    );
    client.release();

    res.json({ link: linkResult.rows[0], schedules: schedulesResult.rows });
  } catch (err) {
    console.error("❌ リンク取得エラー:", err);
    res.status(500).json({ error: "リンク取得に失敗しました" });
  }
});

// === 回答登録 API ===
app.post("/api/respond", async (req, res) => {
  try {
    const { scheduleId, username, status } = req.body;
    if (!scheduleId || !username || !status) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    const client = await pool.connect();
    await client.query(
      `INSERT INTO responses (scheduleid, username, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (scheduleid, username) DO UPDATE
       SET status = EXCLUDED.status`,
      [scheduleId, username, status]
    );
    client.release();

    res.json({ message: "✅ 回答を登録しました" });
  } catch (err) {
    console.error("❌ 回答登録エラー:", err);
    res.status(500).json({ error: "回答登録に失敗しました" });
  }
});

// === 回答取得 API ===
app.get("/api/responses/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      `SELECT s.date, s.timeslot, s.starttime, s.endtime, r.username, r.status
       FROM responses r
       JOIN schedules s ON r.scheduleid = s.id
       WHERE s.linkid=$1
       ORDER BY s.date ASC`,
      [linkId]
    );
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error("❌ 回答取得エラー:", err);
    res.status(500).json({ error: "回答取得に失敗しました" });
  }
});

// === フロントエンド配信 ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 サーバーはポート ${PORT} で実行されています`);
});
