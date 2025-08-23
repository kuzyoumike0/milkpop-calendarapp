const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Railway 環境変数を使用
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ====== schedules テーブル ======
const initSchedules = async () => {
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
initSchedules();

// ====== responses テーブル ======
const initResponses = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      share_id UUID NOT NULL,
      user_name TEXT NOT NULL,
      date DATE NOT NULL,
      answer TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};
initResponses();

// ====== スケジュール保存 ======
app.post("/api/schedules", async (req, res) => {
  const { share_id, dates } = req.body;
  try {
    for (const d of dates) {
      await pool.query(
        "INSERT INTO schedules (share_id, date, type, start_time, end_time) VALUES ($1, $2, $3, $4, $5)",
        [share_id, d.date, d.type, d.start, d.end]
      );
    }
    res.json({ success: true, share_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// ====== スケジュール取得 ======
app.get("/api/schedules/:shareId", async (req, res) => {
  const { shareId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM schedules WHERE share_id = $1 ORDER BY date ASC",
      [shareId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// ====== 回答保存 ======
app.post("/api/responses", async (req, res) => {
  const { share_id, user_name, answers } = req.body; // answers = {date: "〇", ...}
  try {
    const entries = Object.entries(answers);
    for (const [date, answer] of entries) {
      await pool.query(
        "INSERT INTO responses (share_id, user_name, date, answer) VALUES ($1, $2, $3, $4)",
        [share_id, user_name, date, answer]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// ====== 回答一覧取得 ======
app.get("/api/responses/:shareId", async (req, res) => {
  const { shareId } = req.params;
  try {
    const result = await pool.query(
      "SELECT user_name, date, answer FROM responses WHERE share_id = $1 ORDER BY created_at DESC",
      [shareId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// ====== ルート確認用 ======
app.get("/", (req, res) => {
  res.send("✅ MilkPOP Calendar API is running");
});

// ====== Reactビルド配信 ======
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
