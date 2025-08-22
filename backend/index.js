const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== PostgreSQL 接続 =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// ===== 保存API =====
app.post("/api/schedules", async (req, res) => {
  try {
    const schedules = req.body;
    const shareId = uuidv4();

    // DBに保存（share_id ごとにまとめる）
    await pool.query("BEGIN");
    for (const s of schedules) {
      await pool.query(
        `INSERT INTO schedules (share_id, date, type, start_time, end_time) 
         VALUES ($1, $2, $3, $4, $5)`,
        [shareId, s.date, s.type, s.start, s.end]
      );
    }
    await pool.query("COMMIT");

    res.json({ shareId });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// ===== 共有リンク用API =====
app.get("/api/share/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT date, type, start_time, end_time FROM schedules WHERE share_id = $1 ORDER BY date",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }

    res.json({ shareId: id, schedules: result.rows });
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "データ取得に失敗しました" });
  }
});

// ===== 静的ファイル配信（フロントビルド） =====
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
