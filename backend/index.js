// backend/index.js
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// === ミドルウェア ===
app.use(cors());
app.use(bodyParser.json());

// === DB接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Railway/Postgres用
      }
    : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      linkId TEXT,
      username TEXT,
      date TEXT,
      timeslot TEXT,
      comment TEXT,
      token TEXT
    )
  `);
}
initDB().catch(console.error);

// === API ===

// 個人予定追加
app.post("/api/personal", async (req, res) => {
  const { username, date, timeslot } = req.body;
  try {
    const id = uuidv4();
    await pool.query(
      "INSERT INTO schedules (id, username, date, timeslot) VALUES ($1,$2,$3,$4)",
      [id, username, date, timeslot]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error("Error inserting personal schedule:", err);
    res.status(500).json({ error: "Failed to insert schedule" });
  }
});

// 日付指定で共有スケジュール取得
app.get("/api/shared", async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM schedules WHERE date=$1 ORDER BY timeslot",
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching shared schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// 共有リンク作成
app.post("/api/share", async (req, res) => {
  const linkId = uuidv4();
  res.json({ linkId });
});

// 共有リンクに紐づいた予定追加
app.post("/api/share/:linkId", async (req, res) => {
  const { linkId } = req.params;
  const { username, date, timeslot, comment } = req.body;
  try {
    const id = uuidv4();
    const token = uuidv4(); // 予定ごとの秘密キー
    await pool.query(
      "INSERT INTO schedules (id, linkId, username, date, timeslot, comment, token) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [id, linkId, username, date, timeslot, comment, token]
    );
    res.json({ id, token });
  } catch (err) {
    console.error("Error inserting shared schedule:", err);
    res.status(500).json({ error: "Failed to insert schedule" });
  }
});

// 共有リンクに紐づいた予定一覧取得
app.get("/api/shared/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM schedules WHERE linkId=$1 ORDER BY date, timeslot",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching schedules by link:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// 予定更新
app.put("/api/schedule/:id", async (req, res) => {
  const { id } = req.params;
  const { username, date, timeslot, comment, token } = req.body;
  try {
    const result = await pool.query(
      "UPDATE schedules SET username=$1, date=$2, timeslot=$3, comment=$4 WHERE id=$5 AND token=$6 RETURNING *",
      [username, date, timeslot, comment, id, token]
    );
    if (result.rowCount === 0) {
      return res.status(403).json({ error: "Invalid token or schedule not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating schedule:", err);
    res.status(500).json({ error: "Failed to update schedule" });
  }
});

// 予定削除
app.delete("/api/schedule/:id", async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;
  try {
    const result = await pool.query(
      "DELETE FROM schedules WHERE id=$1 AND token=$2 RETURNING *",
      [id, token]
    );
    if (result.rowCount === 0) {
      return res.status(403).json({ error: "Invalid token or schedule not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting schedule:", err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
});

// === React静的ファイル配信 ===
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === サーバー起動 ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
