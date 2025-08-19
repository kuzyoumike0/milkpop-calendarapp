// backend/index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// === ミドルウェア ===
app.use(cors());
app.use(bodyParser.json());

// === PostgreSQL 接続 ===
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

// === 共有スケジュール保存 API ===
app.post("/api/shared", async (req, res) => {
  const { username, mode, dates } = req.body;

  if (!username || !dates || dates.length === 0) {
    return res.status(400).json({ error: "必要な情報が不足しています" });
  }

  try {
    // 既存削除（同じユーザー名のスケジュールを一旦削除）
    await pool.query("DELETE FROM schedules WHERE username = $1", [username]);

    // 日付ごとに保存
    for (const d of dates) {
      await pool.query(
        "INSERT INTO schedules (username, date, mode) VALUES ($1, $2, $3)",
        [username, d, mode]
      );
    }

    res.json({ message: "保存完了" });
  } catch (err) {
    console.error("DB保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 共有スケジュール取得 API ===
app.get("/api/shared", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT username, date, mode FROM schedules ORDER BY username ASC, date ASC"
    );

    res.json(result.rows);
  } catch (err) {
    console.error("DB取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === React ビルドファイルを配信（本番用） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
