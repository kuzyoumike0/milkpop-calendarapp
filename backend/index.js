const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ===============================
// PostgreSQL 接続設定
// ===============================
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT
          ? parseInt(process.env.DB_PORT, 10)
          : 5432,
      }
);

// ===============================
// API ルート
// ===============================

// 個人予定登録
app.post("/api/personal", async (req, res) => {
  const { username, date, timeslot, comment } = req.body;
  try {
    await pool.query(
      "INSERT INTO schedules (username, date, timeslot, comment) VALUES ($1, $2, $3, $4)",
      [username, date, timeslot, comment]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to insert schedule:", err);
    res.status(500).json({ error: "Failed to insert schedule" });
  }
});

// 特定日付の予定取得
app.get("/api/shared", async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM schedules WHERE date = $1 ORDER BY timeslot",
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Failed to fetch schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// 共有リンク作成
app.post("/api/share", async (req, res) => {
  const linkId = uuidv4();
  try {
    await pool.query("INSERT INTO share_links (linkId) VALUES ($1)", [linkId]);
    res.json({ linkId });
  } catch (err) {
    console.error("❌ Failed to create share link:", err);
    res.status(500).json({ error: "Failed to create share link" });
  }
});

// 共有リンクの予定取得
app.get("/api/share/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM schedules 
       WHERE linkId = $1
       ORDER BY date ASC,
         CASE timeslot
           WHEN '終日' THEN 1
           WHEN '昼'   THEN 2
           WHEN '夜'   THEN 3
         END ASC`,
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Failed to fetch shared schedules:", err);
    res.status(500).json({ error: "Failed to fetch shared schedules" });
  }
});

// 共有リンクに予定登録
app.post("/api/share/:linkId", async (req, res) => {
  const { linkId } = req.params;
  const { username, date, timeslot, comment } = req.body;
  try {
    await pool.query(
      "INSERT INTO schedules (username, date, timeslot, comment, linkId) VALUES ($1, $2, $3, $4, $5)",
      [username, date, timeslot, comment, linkId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to insert schedule with link:", err);
    res.status(500).json({ error: "Failed to insert schedule with link" });
  }
});

// 予定削除
app.delete("/api/schedule/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM schedules WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to delete schedule:", err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
});

// 予定編集
app.put("/api/schedule/:id", async (req, res) => {
  const { id } = req.params;
  const { username, date, timeslot, comment } = req.body;
  try {
    await pool.query(
      "UPDATE schedules SET username=$1, date=$2, timeslot=$3, comment=$4 WHERE id=$5",
      [username, date, timeslot, comment, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to update schedule:", err);
    res.status(500).json({ error: "Failed to update schedule" });
  }
});

// ===============================
// 静的ファイル (React build)
// ===============================
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================
// サーバー起動
// ===============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
