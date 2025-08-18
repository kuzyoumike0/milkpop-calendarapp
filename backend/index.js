const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB 接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// =========================
// API
// =========================
app.post("/api/share-link", async (req, res) => {
  try {
    const { dates, slotMode, slot, start_time, end_time, title } = req.body;
    const id = uuidv4();

    await pool.query(
      `INSERT INTO share_links(id, dates, slotmode, slot, start_time, end_time, title)
       VALUES($1, $2, $3, $4, $5, $6, $7)`,
      [id, dates, slotMode, slot, start_time, end_time, title]
    );

    res.json({ url: `/share/${id}` });
  } catch (err) {
    console.error("共有リンク作成エラー:", err);
    res.status(500).json({ error: "共有リンク作成に失敗しました" });
  }
});

app.get("/share/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM share_links WHERE id=$1", [id]);
    if (result.rows.length === 0) return res.status(404).send("リンクが無効です");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send("DBエラー");
  }
});

// =========================
// 静的ファイル配信
// =========================
app.use(express.static(path.join(__dirname, "public")));

// Reactのindex.htmlを返す（catch-all）
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =========================
// サーバー起動
// =========================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
