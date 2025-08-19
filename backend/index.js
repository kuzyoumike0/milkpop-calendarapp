const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// === Express アプリ作成 ===
const app = express();
app.use(cors());
app.use(bodyParser.json());

// === PostgreSQL 接続 ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@db:5432/mydb",
});

// === DB 初期化用関数 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      category TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      linkId TEXT NOT NULL
    );
  `);
}
initDB();

// === API ===

// 予定を追加
app.post("/api/schedule", async (req, res) => {
  try {
    const { username, title, date, category, start_time, end_time } = req.body;
    const linkId = uuidv4();

    await pool.query(
      `INSERT INTO schedules (username, title, date, category, start_time, end_time, linkId)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [username, title, date, category, start_time, end_time, linkId]
    );

    res.json({ success: true, linkId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add schedule" });
  }
});

// 指定リンクの予定を取得（ソート済み）
app.get("/api/shared/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      `SELECT * FROM schedules WHERE linkId = $1 ORDER BY date ASC, start_time ASC`,
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shared schedules" });
  }
});

// 単一削除
app.delete("/api/schedule/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM schedules WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
});

// === React ビルドを配信 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
