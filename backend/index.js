// backend/index.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
import { v4 as uuidv4 } from "uuid";
import Holidays from "date-holidays";

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// PostgreSQL 接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// 初期テーブル作成
(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        dates DATE[] NOT NULL,
        time_range TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS share_links (
        id SERIAL PRIMARY KEY,
        url TEXT UNIQUE NOT NULL,
        schedule_ids INT[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } finally {
    client.release();
  }
})();

// ====================== API ======================

// 祝日取得API（JP）
app.get("/api/holidays/:year", (req, res) => {
  const year = parseInt(req.params.year, 10);
  const hd = new Holidays("JP");
  const holidays = hd.getHolidays(year).map((h) => ({
    date: h.date,
    name: h.name,
  }));
  res.json(holidays);
});

// 日程登録
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, timeRange } = req.body;
    if (!title || !dates || !timeRange) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    const result = await pool.query(
      "INSERT INTO schedules (title, dates, time_range) VALUES ($1, $2, $3) RETURNING id",
      [title, dates, timeRange]
    );

    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Error inserting schedule:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// 共有リンク作成
app.post("/api/share", async (req, res) => {
  try {
    const { scheduleIds } = req.body;
    if (!scheduleIds || scheduleIds.length === 0) {
      return res.status(400).json({ error: "スケジュールが指定されていません" });
    }

    const url = `/share/${uuidv4()}`;
    await pool.query(
      "INSERT INTO share_links (url, schedule_ids) VALUES ($1, $2)",
      [url, scheduleIds]
    );

    res.json({ success: true, url });
  } catch (err) {
    console.error("Error creating share link:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// 共有リンクからスケジュール取得
app.get("/api/share/:uuid", async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const url = `/share/${uuid}`;

    const result = await pool.query("SELECT * FROM share_links WHERE url=$1", [url]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }

    const scheduleIds = result.rows[0].schedule_ids;
    const schedules = await pool.query(
      "SELECT * FROM schedules WHERE id = ANY($1::int[])",
      [scheduleIds]
    );

    res.json({ schedules: schedules.rows });
  } catch (err) {
    console.error("Error fetching shared schedules:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend running on http://localhost:${port}`);
});
