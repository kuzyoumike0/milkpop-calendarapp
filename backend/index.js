const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 8080;

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
    CREATE TABLE IF NOT EXISTS shared_links (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_schedules (
      id SERIAL PRIMARY KEY,
      link_id TEXT REFERENCES shared_links(id),
      date DATE,
      title TEXT,
      username TEXT,
      time_info TEXT
    )
  `);
}

// === API ===

// 新しい共有リンクを発行して予定を登録
app.post("/api/shared", async (req, res) => {
  try {
    const { dates, title, username, timeInfo } = req.body;
    const linkId = uuidv4();

    await pool.query("INSERT INTO shared_links (id) VALUES ($1)", [linkId]);

    for (const date of dates) {
      await pool.query(
        "INSERT INTO shared_schedules (link_id, date, title, username, time_info) VALUES ($1, $2, $3, $4, $5)",
        [linkId, date, title, username, timeInfo]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// リンクごとの予定を取得
app.get("/api/shared/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      "SELECT * FROM shared_schedules WHERE link_id = $1 ORDER BY date ASC",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// サーバー開始
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
  });
});
