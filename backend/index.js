const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// === ミドルウェア ===
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

// === DB初期化 ===
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkId TEXT NOT NULL,
      username TEXT NOT NULL,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      startTime TEXT,
      endTime TEXT,
      category TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log("✅ PostgreSQL initialized");
})();

// === API ===

// 予定を登録して新しい共有リンクを発行
app.post("/api/shared", async (req, res) => {
  try {
    const { username, title, dates, category, startTime, endTime } = req.body;
    const linkId = uuidv4();

    for (const date of dates) {
      await pool.query(
        `INSERT INTO schedules (linkId, username, title, date, startTime, endTime, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [linkId, username, title, date, startTime || null, endTime || null, category]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create shared schedule" });
  }
});

// 共有リンクから予定を取得
app.get("/api/shared/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      `SELECT username, title, date, startTime, endTime, category
       FROM schedules
       WHERE linkId = $1
       ORDER BY date ASC, startTime ASC NULLS FIRST`,
      [linkId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// === 静的ファイル提供 (Reactビルド) ===
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// その他のルートは React に任せる
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === サーバー起動 ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
