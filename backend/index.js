const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ===== 出欠保存API =====
app.post("/api/schedules/:id/responses", async (req, res) => {
  const { id } = req.params;
  const { user, responses } = req.body;

  if (!user || !responses) {
    return res.status(400).json({ ok: false, error: "ユーザー名と出欠が必要です" });
  }

  try {
    // 既存の回答をチェック
    const existing = await pool.query(
      "SELECT * FROM schedule_responses WHERE schedule_id = $1 AND username = $2",
      [id, user]
    );

    if (existing.rows.length > 0) {
      // 更新
      await pool.query(
        "UPDATE schedule_responses SET responses = $1, created_at = CURRENT_TIMESTAMP WHERE schedule_id = $2 AND username = $3",
        [responses, id, user]
      );
    } else {
      // 新規
      await pool.query(
        "INSERT INTO schedule_responses (schedule_id, username, responses) VALUES ($1, $2, $3)",
        [id, user, responses]
      );
    }

    // 最新データを返す
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
