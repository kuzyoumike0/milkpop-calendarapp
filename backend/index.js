const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// === PostgreSQL 接続設定 ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@db:5432/mydb",
});

// === 静的ファイル（React ビルド済み）を配信 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));

// === API ===

// スケジュール共有リンク作成
app.post("/api/sharelink", async (req, res) => {
  try {
    const { dates, category, startTime, endTime, username } = req.body;
    const linkId = uuidv4();

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (date, username, category, starttime, endtime, linkid)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [d, username, category, startTime, endTime, linkId]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("共有リンク作成失敗:", err);
    res.status(500).json({ error: "共有リンク作成失敗" });
  }
});

// 共有リンクから予定を取得
app.get("/api/shared/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      "SELECT date, username, category, starttime, endtime FROM schedules WHERE linkid = $1 ORDER BY date ASC",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("共有リンク取得失敗:", err);
    res.status(500).json({ error: "共有リンク取得失敗" });
  }
});

// React のルーティング対応（フロントでの /share/:id ページ用）
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`サーバー起動中: http://localhost:${PORT}`);
});
