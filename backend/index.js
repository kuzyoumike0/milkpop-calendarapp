const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== PostgreSQL接続 =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// ===== スケジュール作成 =====
app.post("/api/schedules", async (req, res) => {
  const { title, dates, options } = req.body;
  const id = uuidv4();
  const shareToken = uuidv4(); // 初回の共有リンク用トークン

  try {
    await pool.query(
      "INSERT INTO schedules (id, title, dates, options, share_token) VALUES ($1, $2, $3, $4, $5)",
      [id, title || "無題スケジュール", JSON.stringify(dates), JSON.stringify(options), shareToken]
    );

    res.json({
      ok: true,
      id,
      shareUrl: `${process.env.APP_URL || "http://localhost:3000"}/share/${shareToken}`,
    });
  } catch (err) {
    console.error("❌ スケジュール保存エラー:", err);
    res.status(500).json({ ok: false, error: "スケジュール保存に失敗しました" });
  }
});

// ===== スケジュール取得 (idで検索) =====
app.get("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const scheduleRes = await pool.query("SELECT * FROM schedules WHERE id = $1", [id]);
    if (scheduleRes.rows.length === 0) {
      return res.json({ ok: false, error: "スケジュールが見つかりません" });
    }

    res.json({ ok: true, data: scheduleRes.rows[0] });
  } catch (err) {
    console.error("❌ スケジュール取得エラー:", err);
    res.status(500).json({ ok: false, error: "取得に失敗しました" });
  }
});

// ===== 共有リンクからスケジュール取得 =====
app.get("/api/share/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const scheduleRes = await pool.query("SELECT * FROM schedules WHERE share_token = $1", [token]);
    if (scheduleRes.rows.length === 0) {
      return res.json({ ok: false, error: "スケジュールが見つかりません" });
    }
    res.json({ ok: true, data: scheduleRes.rows[0] });
  } catch (err) {
    console.error("❌ 共有リンク取得エラー:", err);
    res.status(500).json({ ok: false, error: "取得に失敗しました" });
  }
});

// ===== 共有リンク再発行 =====
app.post("/api/schedules/:id/share", async (req, res) => {
  const { id } = req.params;
  const newToken = uuidv4();

  try {
    const result = await pool.query(
      "UPDATE schedules SET share_token=$1 WHERE id=$2 RETURNING id, share_token",
      [newToken, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "スケジュールが見つかりません" });
    }

    res.json({
      ok: true,
      shareUrl: `${process.env.APP_URL || "http://localhost:3000"}/share/${newToken}`,
    });
  } catch (err) {
    console.error("❌ 共有リンク更新エラー:", err);
    res.status(500).json({ ok: false, error: "共有リンク発行に失敗しました" });
  }
});

// ===== 個人スケジュール保存（共有スケジュールを完全上書き） =====
app.post("/api/personal", async (req, res) => {
  const { personal_id, share_id, title, memo, dates, options } = req.body;

  try {
    let newPersonalId = personal_id || uuidv4();
    let newShareId = share_id || uuidv4();
    let newToken = uuidv4();

    // 個人スケジュール保存（新規 or 更新）
    await pool.query(
      `INSERT INTO personal_schedules (id, share_id, title, memo, dates, options)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id)
       DO UPDATE SET title=$3, memo=$4, dates=$5, options=$6`,
      [newPersonalId, newShareId, title, memo, JSON.stringify(dates), JSON.stringify(options)]
    );

    // 共有スケジュールを「完全上書き」＆新しい share_token を付与
    await pool.query(
      `INSERT INTO schedules (id, title, dates, options, share_token)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id)
       DO UPDATE SET title=$2, dates=$3, options=$4, share_token=$5`,
      [newShareId, title, JSON.stringify(dates), JSON.stringify(options), newToken]
    );

    res.json({
      ok: true,
      personalId: newPersonalId,
      shareId: newShareId,
      shareUrl: `${process.env.APP_URL || "http://localhost:3000"}/share/${newToken}`,
    });
  } catch (err) {
    console.error("❌ 個人スケジュール保存エラー:", err);
    res.status(500).json({ ok: false, error: "個人スケジュール保存に失敗しました" });
  }
});

// ===== Reactビルド配信 =====
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
