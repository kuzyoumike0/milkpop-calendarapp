const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== PostgreSQL 接続設定 =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // RailwayやHerokuならこれでOK
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ===== スケジュール保存 =====
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, schedules } = req.body;
    const id = uuidv4();

    await pool.query(
      "INSERT INTO schedules (id, title, schedules) VALUES ($1, $2, $3)",
      [id, title, JSON.stringify(schedules)]
    );

    res.json({ id, url: `/share/${id}` });
  } catch (err) {
    console.error("❌ Error inserting schedule:", err);
    res.status(500).json({ error: "DB保存に失敗しました" });
  }
});

// ===== スケジュール取得（共有リンク用） =====
app.get("/api/share/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query("SELECT * FROM schedules WHERE id = $1", [id]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "スケジュールが見つかりません" });
    }
  } catch (err) {
    console.error("❌ Error fetching schedule:", err);
    res.status(500).json({ error: "DB取得に失敗しました" });
  }
});

// ===== フロントエンド静的ファイル提供 =====
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
