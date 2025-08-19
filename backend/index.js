const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

// DB接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@db:5432/mydb",
});

// Reactビルドを提供
app.use(express.static(path.join(__dirname, "../frontend/build")));

// =========================
// 共有リンクAPI
// =========================
app.post("/api/shared", async (req, res) => {
  const { dates, username, category, startTime, endTime } = req.body;

  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return res.status(400).json({ error: "日付が必要です" });
  }

  try {
    const linkId = uuidv4();

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (linkId, date, username, category, startTime, endTime)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [linkId, d, username, category, startTime, endTime]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("共有リンク作成エラー:", err);
    res.status(500).json({ error: "共有リンクの作成に失敗しました" });
  }
});

app.get("/api/shared/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, date, username, category, startTime, endTime FROM schedules WHERE linkId=$1 ORDER BY date ASC",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("共有リンク取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// React の index.html を返す (SPA 対応)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
