const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const app = express();

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

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_links (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_schedules (
      id SERIAL PRIMARY KEY,
      link_id TEXT NOT NULL REFERENCES shared_links(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      title TEXT NOT NULL,
      username TEXT NOT NULL
    );
  `);
}
initDB();

// === 新しいリンク発行 & 予定追加 ===
app.post("/api/shared", async (req, res) => {
  try {
    const { date, title, username } = req.body;
    if (!date || !title || !username) {
      return res.status(400).json({ error: "date, title, username are required" });
    }

    // 新しいリンクIDを発行
    const linkId = uuidv4();
    await pool.query("INSERT INTO shared_links (id) VALUES ($1)", [linkId]);

    // 予定を保存
    await pool.query(
      "INSERT INTO shared_schedules (link_id, date, title, username) VALUES ($1, $2, $3, $4)",
      [linkId, date, title, username]
    );

    res.status(201).json({ message: "Event added successfully", linkId });
  } catch (err) {
    console.error("予定追加エラー:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// === リンクページの予定一覧 ===
app.get("/api/sharelink/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, date, title, username FROM shared_schedules WHERE link_id = $1 ORDER BY date ASC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("共有リンク取得エラー:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// === 静的ファイル配信 ===
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
