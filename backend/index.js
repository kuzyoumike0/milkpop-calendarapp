const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// DB 初期化
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      id SERIAL PRIMARY KEY,
      share_id TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_events (
      id SERIAL PRIMARY KEY,
      share_id TEXT NOT NULL,
      username TEXT NOT NULL,
      event_date DATE NOT NULL
    );
  `);
})();

// 📌 新しい共有リンクを発行
app.post("/api/share-link", async (req, res) => {
  try {
    const shareId = uuidv4();
    await pool.query("INSERT INTO share_links (share_id) VALUES ($1)", [shareId]);
    res.json({ url: `/share/${shareId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create share link" });
  }
});

// 📌 共有リンクの予定取得（ソート済み）
app.get("/api/share/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;
    const result = await pool.query(
      "SELECT username, event_date FROM shared_events WHERE share_id = $1 ORDER BY event_date ASC",
      [shareId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// 📌 共有リンクに予定を追加
app.post("/api/share/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;
    const { username, dates } = req.body; // dates は [ "2025-08-01", "2025-08-03" ] の形式

    for (const d of dates) {
      await pool.query(
        "INSERT INTO shared_events (share_id, username, event_date) VALUES ($1, $2, $3)",
        [shareId, username, d]
      );
    }

    res.json({ message: "Events saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save events" });
  }
});

// 📌 React のルーティング用
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
