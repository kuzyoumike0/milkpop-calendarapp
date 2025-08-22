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
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ===== スケジュール作成 =====
app.post("/api/schedules", async (req, res) => {
  const { title, dates, options } = req.body;
  const id = uuidv4();

  try {
    await pool.query(
      "INSERT INTO schedules (id, title, dates, options) VALUES ($1, $2, $3, $4)",
      [id, title, JSON.stringify(dates), JSON.stringify(options)]
    );
    res.json({ ok: true, id });
  } catch (err) {
    console.error("❌ スケジュール保存エラー:", err);
    res.status(500).json({ ok: false, error: "スケジュール保存に失敗しました" });
  }
});

// ===== スケジュール取得 =====
app.get("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const scheduleRes = await pool.query("SELECT * FROM schedules WHERE id = $1", [id]);
    if (scheduleRes.rows.length === 0) {
      return res.json({ ok: false, error: "スケジュールが見つかりません" });
    }

    const responseRes = await pool.query(
      "SELECT username, responses FROM schedule_responses WHERE schedule_id = $1",
      [id]
    );

    res.json({
      ok: true,
      data: {
        ...scheduleRes.rows[0],
        responses: Object.fromEntries(
          responseRes.rows.map(r => [r.username, r.responses])
        ),
      },
    });
  } catch (err) {
    console.error("❌ スケジュール取得エラー:", err);
    res.status(500).json({ ok: false, error: "取得に失敗しました" });
  }
});

// ===== 出欠保存API（user_idでユニーク管理・名前は最新で上書き） =====
app.post("/api/schedules/:id/responses", async (req, res) => {
  const { id } = req.params;
  const { user_id, username, responses } = req.body;

  if (!user_id || !username || !responses) {
    return res.status(400).json({ ok: false, error: "ユーザーID・名前・出欠が必要です" });
  }

  try {
    await pool.query(
      `INSERT INTO schedule_responses (schedule_id, user_id, username, responses)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (schedule_id, user_id)
       DO UPDATE SET username = EXCLUDED.username,
                     responses = EXCLUDED.responses,
                     created_at = CURRENT_TIMESTAMP`,
      [id, user_id, username, responses]
    );

    const scheduleRes = await pool.query("SELECT * FROM schedules WHERE id = $1", [id]);
    const responseRes = await pool.query(
      "SELECT username, responses FROM schedule_responses WHERE schedule_id = $1",
      [id]
    );

    res.json({
      ok: true,
      data: {
        ...scheduleRes.rows[0],
        responses: Object.fromEntries(
          responseRes.rows.map(r => [r.username, r.responses])
        ),
      },
    });
  } catch (err) {
    console.error("❌ 保存エラー:", err);
    res.status(500).json({ ok: false, error: "DB保存に失敗しました" });
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
