const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@db:5432/mydb",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// DB初期化
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      id TEXT PRIMARY KEY,
      dates TEXT[],
      slotmode TEXT,
      slot TEXT,
      start_time TEXT,
      end_time TEXT,
      title TEXT
    );
  `);
  console.log("✅ DB スキーマ初期化完了");
}
initDB();

// --- API: 共有リンク発行 ---
app.post("/api/share-link", async (req, res) => {
  try {
    const { dates, slotMode, slot, start_time, end_time, title } = req.body;
    const id = uuidv4();

    await pool.query(
      `INSERT INTO share_links(id, dates, slotmode, slot, start_time, end_time, title)
       VALUES($1, $2, $3, $4, $5, $6, $7)`,
      [id, dates, slotMode, slot, start_time, end_time, title]
    );

    res.json({ url: `http://localhost:${PORT}/share/${id}` });
  } catch (err) {
    console.error("共有リンク作成エラー:", err);
    res.status(500).json({ error: "共有リンク作成に失敗しました" });
  }
});

// --- API: 共有リンク取得 ---
app.get("/share/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM share_links WHERE id=$1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send("リンクが存在しません");
    }
    res.send(`
      <html>
        <head><title>共有リンク</title></head>
        <body style="font-family: sans-serif;">
          <h1>📅 共有スケジュール</h1>
          <pre>${JSON.stringify(result.rows[0], null, 2)}</pre>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("共有リンク取得エラー:", err);
    res.status(500).send("エラーが発生しました");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);

  // これを backend/index.js の一番下に追加
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

});
