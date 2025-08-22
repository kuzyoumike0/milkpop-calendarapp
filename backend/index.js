// backend/index.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== PostgreSQL 接続 =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railwayの環境変数
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// 初期化 (テーブル作成)
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id UUID PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ PostgreSQL ready");
  } catch (err) {
    console.error("❌ DB init error:", err);
  }
})();

// ===== 登録 =====
app.post("/api/schedules", async (req, res) => {
  try {
    const id = uuidv4();
    const data = req.body.schedules;

    await pool.query("INSERT INTO schedules (id, data) VALUES ($1, $2)", [
      id,
      data,
    ]);

    console.log("📥 保存:", id);
    res.json({ ok: true, id });
  } catch (err) {
    console.error("❌ 保存エラー:", err);
    res.status(500).json({ ok: false, message: "DB Error" });
  }
});

// ===== 取得 =====
app.get("/api/schedules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT data FROM schedules WHERE id=$1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Not found" });
    }

    res.json({ ok: true, schedules: result.rows[0].data });
  } catch (err) {
    console.error("❌ 取得エラー:", err);
    res.status(500).json({ ok: false, message: "DB Error" });
  }
});

// ===== Reactビルド配信 =====
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
