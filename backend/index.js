const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "calendar",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      dates TEXT[] NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      linkId TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS personal (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      dates TEXT[] NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_responses (
      id SERIAL PRIMARY KEY,
      linkId TEXT NOT NULL,
      username TEXT NOT NULL,
      dates TEXT[] NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL
    );
  `);
}
initDB();

// === API ===

// 個人スケジュール登録
app.post("/api/personal", async (req, res) => {
  const { title, memo, dates, timeslot, range_mode } = req.body;
  try {
    await pool.query(
      "INSERT INTO personal (title, memo, dates, timeslot, range_mode) VALUES ($1,$2,$3,$4,$5)",
      [title, memo, dates, timeslot, range_mode]
    );
    res.json({ message: "保存しました" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// 個人スケジュール取得
app.get("/api/personal", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM personal ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// 日程スケジュール登録（共有リンク発行）
app.post("/api/schedules", async (req, res) => {
  const { title, dates, timeslot, range_mode } = req.body;
  const linkId = uuidv4();
  try {
    await pool.query(
      "INSERT INTO schedules (title, dates, timeslot, range_mode, linkId) VALUES ($1,$2,$3,$4,$5)",
      [title, dates, timeslot, range_mode, linkId]
    );
    res.json({ message: "保存しました", linkId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// 登録済みスケジュール一覧
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// 共有スケジュール保存
app.post("/api/share/:linkId", async (req, res) => {
  const { linkId } = req.params;
  const { username, dates, timeslot, range_mode } = req.body;
  try {
    await pool.query(
      "INSERT INTO share_responses (linkId, username, dates, timeslot, range_mode) VALUES ($1,$2,$3,$4,$5)",
      [linkId, username, dates, timeslot, range_mode]
    );
    res.json({ message: "保存しました" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// 共有スケジュール取得
app.get("/api/share/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM share_responses WHERE linkId=$1 ORDER BY id DESC",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === フロントエンド配信 ===
const buildPath = path.join(__dirname, "../frontend/build");
const indexPath = path.join(buildPath, "index.html");

// 起動前にチェック
if (!fs.existsSync(indexPath)) {
  console.error("❌ Frontend build not found. Run 'npm run build' inside /frontend first.");
  process.exit(1); // ← ファイルが無ければ即終了
}

app.use(express.static(buildPath));
app.get("*", (req, res) => {
  res.sendFile(indexPath);
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
