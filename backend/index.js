const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

// === DB 初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      id SERIAL PRIMARY KEY,
      share_id TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      share_id TEXT REFERENCES share_links(share_id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      date DATE NOT NULL
    );
  `);

  // 既存テーブルに share_id が無い場合は追加
  const res = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name='share_links' AND column_name='share_id';
  `);

  if (res.rowCount === 0) {
    await pool.query(`ALTER TABLE share_links ADD COLUMN share_id TEXT UNIQUE;`);
    // 古いデータにUUIDを入れる
    await pool.query(`UPDATE share_links SET share_id = gen_random_uuid() WHERE share_id IS NULL;`);
  }

  console.log("✅ Database initialized");
}

// === API ===

// 共有リンク作成
app.post("/api/share", async (req, res) => {
  try {
    const shareId = uuidv4();

    await pool.query(
      "INSERT INTO share_links (share_id) VALUES ($1) ON CONFLICT DO NOTHING",
      [shareId]
    );

    res.json({ success: true, shareId });
  } catch (err) {
    console.error("Error creating share link:", err);
    res.status(500).json({ error: "Failed to create share link" });
  }
});

// スケジュール追加
app.post("/api/schedule", async (req, res) => {
  try {
    const { shareId, username, date } = req.body;

    await pool.query(
      "INSERT INTO schedules (share_id, username, date) VALUES ($1, $2, $3)",
      [shareId, username, date]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error inserting schedule:", err);
    res.status(500).json({ error: "Failed to insert schedule" });
  }
});

// 共有リンクのスケジュール一覧取得
app.get("/api/schedules/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;

    const result = await pool.query(
      "SELECT username, date FROM schedules WHERE share_id = $1 ORDER BY date ASC",
      [shareId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// サーバー起動
const PORT = process.env.PORT || 8080;
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});
