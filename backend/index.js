import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// =========================
// PostgreSQL 接続設定
// =========================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/calendar_db",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// =========================
// API エンドポイント
// =========================

// 動作確認用
app.get("/", (req, res) => {
  res.send("✅ Backend API is running");
});

// スケジュール登録
app.post("/api/schedules", async (req, res) => {
  const { schedules } = req.body;
  if (!schedules || !Array.isArray(schedules)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const results = [];
    for (const s of schedules) {
      const result = await pool.query(
        `INSERT INTO schedules (date, time, start_time, end_time)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [s.date, s.time || null, s.start || null, s.end || null]
      );
      results.push(result.rows[0]);
    }
    res.json({ success: true, inserted: results });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 登録されたスケジュール一覧を取得
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules ORDER BY date ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// =========================
// サーバー起動
// =========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
