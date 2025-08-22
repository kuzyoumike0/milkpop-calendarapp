const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Railway の環境変数を使って接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ====== 初期化: テーブル作成 ======
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      share_id UUID NOT NULL,
      date DATE NOT NULL,
      type TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT
    );
  `);
};
initDB();

// ====== スケジュール保存 ======
app.post("/api/schedules", async (req, res) => {
  try {
    const schedules = req.body; // [{date, type, start, end}]
    const shareId = uuidv4();

    const client = await pool.connect();
    try {
      for (const s of schedules) {
        await client.query(
          `INSERT INTO schedules (share_id, date, type, start_time, end_time)
           VALUES ($1, $2, $3, $4, $5)`,
          [shareId, s.date, s.type, s.start, s.end]
        );
      }
    } finally {
      client.release();
    }

    res.json({ ok: true, url: `${process.env.FRONTEND_URL}/share/${shareId}` });
  } catch (err) {
    console.error("❌ 保存エラー:", err);
    res.status(500).json({ ok: false, error: "保存に失敗しました" });
  }
});

// ====== 共有リンクから取得 ======
app.get("/api/share/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT date, type, start_time AS start, end_time AS end FROM schedules WHERE share_id = $1 ORDER BY date ASC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ 取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
