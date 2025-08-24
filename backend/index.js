// backend/index.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import authRouter from "./auth.js";　//OAuth2の設定

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

// ===== DB接続設定 =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway の環境変数
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(bodyParser.json());

// ===== API =====

// --- OAuthhへのルーティング ---
app.use("/auth", authRouter);

// --- 共有スケジュール一覧取得 ---
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("DB読み込みエラー:", err);
    res.status(500).json({ error: "DB読み込みエラー" });
  }
});

// --- 共有スケジュール作成 ---
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, options } = req.body;
    if (!title || !dates) {
      return res.status(400).json({ error: "タイトルと日程は必須です" });
    }

    const id = uuidv4();
    const shareToken = uuidv4();

    const result = await pool.query(
      `INSERT INTO schedules (id, title, dates, options, share_token) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, title, JSON.stringify(dates), JSON.stringify(options || {}), shareToken]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB保存エラー:", err);
    res.status(500).json({ error: "DB保存エラー" });
  }
});

// --- 特定スケジュール取得 ---
app.get("/api/schedules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM schedules WHERE id=$1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB取得エラー:", err);
    res.status(500).json({ error: "DB取得エラー" });
  }
});

// --- 出欠回答を追加/更新 ---
app.post("/api/schedules/:id/responses", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, username, responses } = req.body;

    if (!user_id || !responses) {
      return res.status(400).json({ error: "ユーザーIDと回答は必須です" });
    }

    const result = await pool.query(
      `INSERT INTO schedule_responses (schedule_id, user_id, username, responses)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (schedule_id, user_id)
       DO UPDATE SET username = EXCLUDED.username, responses = EXCLUDED.responses, created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [id, user_id, username || "匿名", JSON.stringify(responses)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("回答保存エラー:", err);
    res.status(500).json({ error: "回答保存エラー" });
  }
});

// --- 個人スケジュール保存 ---
app.post("/api/personal", async (req, res) => {
  try {
    const { share_id, title, memo, dates, options } = req.body;
    if (!share_id || !title || !dates) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO personal_schedules (id, share_id, title, memo, dates, options) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, share_id, title, memo || "", JSON.stringify(dates), JSON.stringify(options || {})]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("個人スケジュール保存エラー:", err);
    res.status(500).json({ error: "個人スケジュール保存エラー" });
  }
});

// --- 共有リンクから取得 ---
app.get("/share/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const result = await pool.query("SELECT * FROM schedules WHERE share_token=$1", [token]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "共有リンクが無効です" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("共有リンク取得エラー:", err);
    res.status(500).json({ error: "共有リンク取得エラー" });
  }
});

// ===== Reactビルドを配信 =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildPath = path.join(__dirname, "public");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// ===== サーバー起動 =====
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
