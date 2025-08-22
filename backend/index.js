// backend/index.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== DB接続 =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false, // ローカルではSSLなし
});

// ===== 初期化 =====
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        share_id UUID NOT NULL,
        title TEXT,
        date DATE NOT NULL,
        time_type TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        share_id UUID NOT NULL,
        name TEXT NOT NULL,
        schedule_id INT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ DB Init Error:", err);
  }
};
initDB();

// ===== スケジュール保存 =====
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, timeType, startTime, endTime } = req.body;
    const shareId = uuidv4();

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (share_id, title, date, time_type, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [shareId, title, d, timeType, startTime, endTime]
      );
    }

    // Railway 環境の URL を推測
    const baseUrl =
      process.env.PUBLIC_URL ||
      (process.env.RAILWAY_STATIC_URL
        ? `https://${process.env.RAILWAY_STATIC_URL}`
        : `http://localhost:${PORT}`);

    const shareUrl = `${baseUrl}/share/${shareId}`;
    res.json({ success: true, shareUrl });
  } catch (err) {
    console.error("❌ Error saving schedule:", err);
    res.status(500).json({ success: false, error: "保存エラー" });
  }
});

// ===== スケジュール取得 =====
app.get("/api/share/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;
    const result = await pool.query(
      "SELECT * FROM schedules WHERE share_id = $1 ORDER BY date ASC",
      [shareId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching schedules:", err);
    res.status(500).json({ error: "取得エラー" });
  }
});

// ===== 回答保存 =====
app.post("/api/share/:shareId/responses", async (req, res) => {
  try {
    const { shareId } = req.params;
    const { name, responses } = req.body;

    for (const [scheduleId, response] of Object.entries(responses)) {
      await pool.query(
        `INSERT INTO responses (share_id, name, schedule_id, response)
         VALUES ($1, $2, $3, $4)`,
        [shareId, name, scheduleId, response]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving responses:", err);
    res.status(500).json({ success: false, error: "回答保存エラー" });
  }
});

// ===== 共有リンク一覧 =====
app.get("/api/share-links", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT share_id, title
      FROM schedules
      ORDER BY share_id DESC
      LIMIT 20
    `);

    const baseUrl =
      process.env.PUBLIC_URL ||
      (process.env.RAILWAY_STATIC_URL
        ? `https://${process.env.RAILWAY_STATIC_URL}`
        : `http://localhost:${PORT}`);

    const links = result.rows.map((row) => ({
      id: row.share_id,
      title: row.title,
      url: `${baseUrl}/share/${row.share_id}`,
    }));

    res.json(links);
  } catch (err) {
    console.error("❌ Error fetching share links:", err);
    res.status(500).json({ error: "リンク取得エラー" });
  }
});

// ===== 静的ファイル配信 =====
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
