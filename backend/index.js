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
        ssl: { rejectUnauthorized: false }, // Railway 本番用
      }
    : {
        host: process.env.DB_HOST || "localhost", // ローカル開発用
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
        choice TEXT NOT NULL CHECK (choice IN ('◯', '×')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ データベースを初期化しました");
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
    const linkId = uuidv4();

    await client.query("INSERT INTO links (id, title) VALUES ($1, $2)", [
      linkId,
      title,
    ]);

    for (const d of dates) {
      if (d.startTime && d.endTime && d.startTime >= d.endTime) {
        throw new Error("開始時間は終了時間より前にしてください");
      }

      await client.query(
        "INSERT INTO schedules (link_id, date, timeslot, starttime, endtime) VALUES ($1, $2, $3, $4, $5)",
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

    const linkResult = await client.query("SELECT * FROM links WHERE id=$1", [
      linkId,
    ]);
    if (linkResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: "リンクが見つかりません" });
    }

    const schedulesResult = await client.query(
      "SELECT * FROM schedules WHERE link_id=$1 ORDER BY date ASC",
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
    const { linkId, date, timeslot, username, choice } = req.body;
    if (!linkId || !date || !timeslot || !username || !choice) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    const client = await pool.connect();
    await client.query(
      `INSERT INTO responses (link_id, date, timeslot, username, choice)
       VALUES ($1, $2, $3, $4, $5)`,
      [linkId, date, timeslot, username, choice]
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
      `SELECT r.date, r.timeslot, r.username, r.choice
       FROM responses r
       WHERE r.link_id=$1
       ORDER BY r.date ASC`,
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
