const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// ======== DB 接続設定 ========
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// ======== ミドルウェア ========
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ======== DB 初期化 ========
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      id TEXT PRIMARY KEY,
      dates TEXT[] NOT NULL,
      slotmode TEXT NOT NULL,
      slot TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      title TEXT
    );
  `);
  console.log("✅ DB 初期化完了");
}

// ======== API: 共有リンク作成 ========
app.post("/api/share-link", async (req, res) => {
  try {
    const { dates, slotmode, slot, start_time, end_time, title } = req.body;

    const id = uuidv4();

    await pool.query(
      `INSERT INTO share_links (id, dates, slotmode, slot, start_time, end_time, title)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, dates, slotmode, slot, start_time, end_time, title]
    );

    res.json({ url: `/share/${id}` });
  } catch (err) {
    console.error("❌ 共有リンク作成エラー:", err);
    res.status(500).json({ error: "共有リンク作成に失敗しました" });
  }
});

// ======== API: 共有リンク取得 ========
app.get("/api/share-link/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM share_links WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "共有リンクが見つかりません" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ 共有リンク取得エラー:", err);
    res.status(500).json({ error: "共有リンク取得に失敗しました" });
  }
});

// ======== フロントエンド返却 ========
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======== サーバー起動 ========
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ サーバー起動: http://localhost:${PORT}`);
  });
});
