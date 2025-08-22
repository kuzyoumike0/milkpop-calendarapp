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

// ===== PostgreSQL 接続 =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// ===== スケジュール作成 =====
app.post("/api/schedules", async (req, res) => {
  try {
    const { title = "新しいスケジュール", dates, options } = req.body;
    const id = uuidv4();
    const shareToken = uuidv4();

    await pool.query(
      `INSERT INTO schedules (id, title, dates, options, share_token)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, title, JSON.stringify(dates), JSON.stringify(options), shareToken]
    );

    res.json({
      ok: true,
      id,
      shareUrl: `${req.protocol}://${req.get("host")}/share/${shareToken}`,
    });
  } catch (err) {
    console.error("❌ スケジュール保存エラー:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ===== スケジュール取得 =====
app.get("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const scheduleRes = await pool.query(
      "SELECT * FROM schedules WHERE id = $1",
      [id]
    );
    if (scheduleRes.rows.length === 0) {
      return res.json({ ok: false, error: "スケジュールが見つかりません" });
    }

    res.json({
      ok: true,
      data: scheduleRes.rows[0],
    });
  } catch (err) {
    console.error("❌ スケジュール取得エラー:", err);
    res.status(500).json({ ok: false, error: "取得に失敗しました" });
  }
});

// ===== 個人スケジュール保存（共有スケジュールを完全上書き） =====
app.post("/api/personal", async (req, res) => {
  const { personal_id, share_id, title, memo, dates, options } = req.body;

  try {
    let newPersonalId = personal_id || uuidv4();
    let newShareId = share_id || uuidv4();

    // 個人スケジュール保存（新規 or 更新）
    await pool.query(
      `INSERT INTO personal_schedules (id, share_id, title, memo, dates, options)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id)
       DO UPDATE SET title=$3, memo=$4, dates=$5, options=$6`,
      [
        newPersonalId,
        newShareId,
        title,
        memo,
        JSON.stringify(dates),
        JSON.stringify(options),
      ]
    );

    // 共有スケジュールを「完全上書き」
    const shareToken = uuidv4();
    await pool.query(
      `INSERT INTO schedules (id, title, dates, options, share_token)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id)
       DO UPDATE SET title=$2, dates=$3, options=$4, share_token=$5`,
      [
        newShareId,
        title,
        JSON.stringify(dates),
        JSON.stringify(options),
        shareToken,
      ]
    );

    res.json({
      ok: true,
      personalId: newPersonalId,
      shareId: newShareId,
      shareUrl: `${req.protocol}://${req.get("host")}/share/${shareToken}`,
    });
  } catch (err) {
    console.error("❌ 個人スケジュール保存エラー:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ===== React ビルド配信 =====
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
