const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB接続設定 ===
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

// === スケジュール一覧取得 ===
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM schedules ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB取得エラー");
  }
});

// === スケジュール追加 ===
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, memo, timeType, startTime, endTime } = req.body;
    const result = await pool.query(
      `INSERT INTO schedules (title, memo, time_type, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, memo, timeType, startTime, endTime]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB保存エラー");
  }
});

// === スケジュール更新（時間帯変更など） ===
app.put("/api/schedules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { timeType, startTime, endTime } = req.body;
    const result = await pool.query(
      `UPDATE schedules 
       SET time_type=$1, start_time=$2, end_time=$3
       WHERE id=$4 RETURNING *`,
      [timeType, startTime, endTime, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB更新エラー");
  }
});

// === スケジュール削除 ===
app.delete("/api/schedules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM schedules WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB削除エラー");
  }
});

// === フロントエンドの静的ファイル配信 ===
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));

// React Router 対応: どのルートでも index.html を返す
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
