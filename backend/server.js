// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL 接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// =====================
// 共有予定 API
// =====================

// 取得
app.get("/api/shared", async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM shared_events WHERE date=$1 ORDER BY time_slot",
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 追加
app.post("/api/shared", async (req, res) => {
  const { title, time_slot, created_by, date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO shared_events(title, time_slot, created_by, date) VALUES($1,$2,$3,$4) RETURNING *",
      [title, time_slot, created_by, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 削除
app.delete("/api/shared/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM shared_events WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "該当予定がありません" });
    }
    res.json({ message: "削除成功", deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// 個人予定 API
// =====================

// 取得
app.get("/api/personal/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { date } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM personal_events WHERE user_id=$1 AND date=$2 ORDER BY time_slot",
      [user_id, date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 追加
app.post("/api/personal", async (req, res) => {
  const { user_id, title, time_slot, date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO personal_events(user_id, title, time_slot, date) VALUES($1,$2,$3,$4) RETURNING *",
      [user_id, title, time_slot, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 削除
app.delete("/api/personal/:user_id/:id", async (req, res) => {
  const { user_id, id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM personal_events WHERE user_id=$1 AND id=$2 RETURNING *",
      [user_id, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "該当予定がありません" });
    }
    res.json({ message: "削除成功", deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// 静的ファイル配信 & SPA対応
// =====================
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =====================
// サーバー起動
// =====================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
