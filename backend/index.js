const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

// === アプリ生成 ===
const app = express();

// === ミドルウェア設定 ===
app.use(bodyParser.json());
app.use(cors());

// === DB 接続設定 ===
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

// === DB 初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      uuid UUID NOT NULL,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      time TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}
initDB().catch((err) => console.error("DB init error:", err));

// === API エンドポイント例 ===
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules ORDER BY date ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/schedules", async (req, res) => {
  try {
    const { title, date, time } = req.body;
    const result = await pool.query(
      "INSERT INTO schedules (uuid, title, date, time) VALUES ($1, $2, $3, $4) RETURNING *",
      [uuidv4(), title, date, time]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database insert error" });
  }
});

// === フロントエンド (React build) 配信 ===
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
