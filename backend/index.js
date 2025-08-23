const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");

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
      title TEXT NOT NULL,
      dates JSONB NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      share_id UUID NOT NULL,
      user_name TEXT NOT NULL,
      answers JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};
initDB();

// ====== スケジュール保存 ======
app.post("/api/schedules", async (req, res) => {
  try {
    const { share_id, title, dates } = req.body;
    await pool.query(
      `INSERT INTO schedules (share_id, title, dates) VALUES ($1, $2, $3)`,
      [share_id, title, JSON.stringify(dates)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving schedule:", err);
    res.status(500).json({ error: "Failed to save schedule" });
  }
});

// ====== スケジュール取得 ======
app.get("/api/schedules/:share_id", async (req, res) => {
  try {
    const { share_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM schedules WHERE share_id = $1`,
      [share_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching schedule:", err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

// ====== 回答保存 ======
app.post("/api/responses", async (req, res) => {
  try {
    const { share_id, user_name, answers } = req.body;
    if (!share_id || !user_name || !answers) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await pool.query(
      `INSERT INTO responses (share_id, user_name, answers)
       VALUES ($1, $2, $3)`,
      [share_id, user_name, JSON.stringify(answers)]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error saving response:", err);
    res.status(500).json({ error: "Failed to save response" });
  }
});

// ====== 回答取得 ======
app.get("/api/responses/:share_id", async (req, res) => {
  try {
    const { share_id } = req.params;
    const result = await pool.query(
      `SELECT user_name, answers, created_at
       FROM responses WHERE share_id = $1
       ORDER BY created_at ASC`,
      [share_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching responses:", err);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

// ====== フロントエンド配信設定 ======
// Reactのbuildフォルダを静的ファイルとして提供
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));

// API以外のリクエストはReactに任せる
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ====== サーバー起動 ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
