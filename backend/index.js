const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === PostgreSQL 接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === 共有リンク作成 ===
app.post("/api/share", async (req, res) => {
  try {
    const linkId = uuidv4();
    await pool.query("INSERT INTO share_links (linkId, createdAt) VALUES ($1, NOW())", [linkId]);
    res.json({ linkId });
  } catch (err) {
    console.error("❌ /api/share error:", err);
    res.status(500).json({ error: "共有リンク作成に失敗しました" });
  }
});

// === 共有リンクに予定を追加 ===
app.post("/api/share/:linkId", async (req, res) => {
  const { linkId } = req.params;
  const { username, date, timeslot, comment } = req.body;
  const token = uuidv4();
  try {
    const result = await pool.query(
      `INSERT INTO schedules (id, linkId, username, date, timeslot, comment, token)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [uuidv4(), linkId, username, date, timeslot, comment, token]
    );
    res.json({ id: result.rows[0].id, token });
  } catch (err) {
    console.error("❌ /api/share/:linkId error:", err);
    res.status(500).json({ error: "予定の登録に失敗しました" });
  }
});

// === 指定リンクの予定取得 ===
app.get("/api/shared/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, username, date, timeslot, comment FROM schedules WHERE linkId=$1 ORDER BY date ASC, timeslot ASC",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ /api/shared/:linkId error:", err);
    res.status(500).json({ error: "予定取得に失敗しました" });
  }
});

// === 予定更新 ===
app.put("/api/schedule/:id", async (req, res) => {
  const { id } = req.params;
  const { username, date, timeslot, comment, token } = req.body;
  try {
    const check = await pool.query("SELECT token FROM schedules WHERE id=$1", [id]);
    if (check.rowCount === 0 || check.rows[0].token !== token) {
      return res.status(403).json({ error: "認証エラー" });
    }
    await pool.query(
      "UPDATE schedules SET username=$1, date=$2, timeslot=$3, comment=$4 WHERE id=$5",
      [username, date, timeslot, comment, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ /api/schedule/:id PUT error:", err);
    res.status(500).json({ error: "更新失敗" });
  }
});

// === 予定削除 ===
app.delete("/api/schedule/:id", async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;
  try {
    const check = await pool.query("SELECT token FROM schedules WHERE id=$1", [id]);
    if (check.rowCount === 0 || check.rows[0].token !== token) {
      return res.status(403).json({ error: "認証エラー" });
    }
    await pool.query("DELETE FROM schedules WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ /api/schedule/:id DELETE error:", err);
    res.status(500).json({ error: "削除失敗" });
  }
});

// === フロントエンド配信 ===
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
