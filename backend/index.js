const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

// DB 接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ✅ GET / のルートを追加（これで必ず応答する）
app.get("/", (req, res) => {
  res.send("✅ Calendar backend is running");
});

// 共有リンク発行
app.post("/api/share-link", async (req, res) => {
  const { dates, slotMode, slot, start_time, end_time, title } = req.body;
  const shareId = uuidv4();

  try {
    await pool.query(
      `INSERT INTO share_links (id, dates, slotMode, slot, start_time, end_time, title)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [shareId, dates, slotMode, slot, start_time, end_time, title]
    );

    res.json({ url: `${process.env.BASE_URL || "http://localhost:8080"}/share/${shareId}` });
  } catch (err) {
    console.error(err);
    res.status(500).send("DBエラー");
  }
});

// 共有リンクから予定取得
app.get("/share/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM share_links WHERE id=$1", [id]);
    if (result.rows.length === 0) return res.status(404).send("リンクが無効です");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send("DBエラー");
  }
});

app.listen(8080, () => {
  console.log("✅ Server running on http://localhost:8080");
});
