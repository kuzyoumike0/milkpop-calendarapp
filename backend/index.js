import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL 接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());

// APIルート
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// スケジュール保存API
app.post("/api/schedules", async (req, res) => {
  try {
    const schedules = req.body; // [{date, time, start, end}, ...]

    const client = await pool.connect();

    for (const s of schedules) {
      await client.query(
        `INSERT INTO schedules (date, time_option, start_hour, end_hour) 
         VALUES ($1, $2, $3, $4)`,
        [s.date, s.time || null, s.start || null, s.end || null]
      );
    }

    client.release();
    res.json({ success: true, count: schedules.length });
  } catch (err) {
    console.error("DB insert error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
