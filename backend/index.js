const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

// === PostgreSQL 接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      linkId TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      timeSlot TEXT NOT NULL,
      mode TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkId TEXT REFERENCES links(linkId) ON DELETE CASCADE,
      date DATE NOT NULL
    );
  `);
}
initDB();

// === 共有リンク発行 ===
app.post("/api/create-link", async (req, res) => {
  try {
    const { title, dates, timeSlot, mode } = req.body;
    if (!title || !dates || dates.length === 0) {
      return res.status(400).json({ error: "タイトルと日付は必須です" });
    }

    const linkId = uuidv4();

    // links テーブルに保存
    await pool.query(
      `INSERT INTO links (linkId, title, timeSlot, mode) VALUES ($1, $2, $3, $4)`,
      [linkId, title, timeSlot, mode]
    );

    // schedules テーブルに保存
    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (linkId, date) VALUES ($1, $2)`,
        [linkId, d]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("共有リンク発行失敗:", err);
    res.status(500).json({ error: "共有リンク発行に失敗しました" });
  }
});

// === 共有ページ取得 ===
app.get("/api/schedules/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    const linkResult = await pool.query(`SELECT * FROM links WHERE linkId=$1`, [linkId]);
    if (linkResult.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }

    const schedulesResult = await pool.query(
      `SELECT * FROM schedules WHERE linkId=$1 ORDER BY date ASC`,
      [linkId]
    );

    res.json({
      title: linkResult.rows[0].title,
      timeSlot: linkResult.rows[0].timeSlot,
      mode: linkResult.rows[0].mode,
      dates: schedulesResult.rows.map((r) => r.date),
    });
  } catch (err) {
    console.error("取得失敗:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 本番用: React ビルド提供 ===
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
