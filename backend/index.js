const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// === PostgreSQL 接続設定 ===
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
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkId TEXT,
      title TEXT,
      date TEXT,
      timeSlot TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      linkId TEXT,
      name TEXT,
      responses JSONB
    );
  `);
}
initDB();

// === API: 共有リンク作成 ===
app.post("/api/create-link", async (req, res) => {
  try {
    const { title, date, timeSlot, startHour, endHour } = req.body;
    const linkId = uuidv4();

    await pool.query(
      "INSERT INTO schedules (linkId, title, date, timeSlot) VALUES ($1, $2, $3, $4)",
      [
        linkId,
        title,
        new Date(date).toLocaleDateString("ja-JP"),
        timeSlot === "時間指定" ? `${startHour}時〜${endHour}時` : timeSlot,
      ]
    );

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成失敗:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === API: 日程共有ページ取得 ===
app.get("/api/share/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    const scheduleRes = await pool.query(
      "SELECT date, timeSlot FROM schedules WHERE linkId=$1",
      [linkId]
    );

    const responseRes = await pool.query(
      "SELECT name, responses FROM responses WHERE linkId=$1",
      [linkId]
    );

    res.json({
      schedules: scheduleRes.rows,
      participants: responseRes.rows,
    });
  } catch (err) {
    console.error("共有ページ取得失敗:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === API: 出欠保存 ===
app.post("/api/share/:linkId/save", async (req, res) => {
  try {
    const { linkId } = req.params;
    const { name, responses } = req.body;

    // 既存削除して最新状態に
    await pool.query("DELETE FROM responses WHERE linkId=$1 AND name=$2", [
      linkId,
      name,
    ]);

    await pool.query(
      "INSERT INTO responses (linkId, name, responses) VALUES ($1, $2, $3)",
      [linkId, name, responses]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("保存失敗:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 静的ファイル配信（Reactビルド済み） ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
