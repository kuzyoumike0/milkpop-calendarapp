const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

// === Express 初期化 ===
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

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
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkId TEXT NOT NULL,
      date DATE NOT NULL,
      timeSlot TEXT NOT NULL,
      username TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      linkId TEXT PRIMARY KEY,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB().catch((err) => console.error("DB初期化エラー:", err));


// === リンク作成API ===
app.post("/api/create-link", async (req, res) => {
  try {
    const linkId = uuidv4();
    await pool.query("INSERT INTO links (linkId) VALUES ($1)", [linkId]);
    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === スケジュール保存API（保存後に即時反映用データ返却） ===
app.post("/api/schedule", async (req, res) => {
  const { linkId, date, timeSlot, username, status } = req.body;

  if (!linkId || !date || !timeSlot || !username || !status) {
    return res.status(400).json({ error: "必須項目が不足しています" });
  }

  try {
    await pool.query(
      `INSERT INTO schedules (linkId, date, timeSlot, username, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [linkId, date, timeSlot, username, status]
    );

    // 保存後、最新データを返却
    const result = await pool.query(
      `SELECT * FROM schedules WHERE linkId = $1 ORDER BY date, timeSlot`,
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("スケジュール保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === スケジュール取得API ===
app.get("/api/schedules/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM schedules WHERE linkId = $1 ORDER BY date, timeSlot`,
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === フロントエンド配信 ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
