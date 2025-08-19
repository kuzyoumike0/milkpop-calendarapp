const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// === PostgreSQL 接続設定 ===
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

// === ミドルウェア ===
app.use(cors());
app.use(bodyParser.json());

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkId TEXT NOT NULL,
      title TEXT,
      date TEXT NOT NULL,
      timeSlot TEXT NOT NULL,
      username TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);
}
initDB();

// === API: 共有リンク発行 ===
app.post("/api/create-link", async (req, res) => {
  const { title } = req.body;
  const linkId = uuidv4();
  try {
    await pool.query("INSERT INTO schedules (linkId, title, date, timeSlot, username, status) VALUES ($1,$2,$3,$4,$5,$6)", [
      linkId,
      title || "",
      "", "", "", ""
    ]);
    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成失敗:", err);
    res.status(500).json({ error: "リンク作成失敗" });
  }
});

// === API: スケジュール取得 ===
app.get("/api/schedules/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM schedules WHERE linkId=$1 ORDER BY date, timeSlot", [linkId]);
    res.json(result.rows);
  } catch (err) {
    console.error("取得失敗:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// === API: スケジュール登録 ===
app.post("/api/schedule", async (req, res) => {
  const { linkId, date, timeSlot, username, status } = req.body;
  try {
    await pool.query(
      "INSERT INTO schedules (linkId, date, timeSlot, username, status) VALUES ($1,$2,$3,$4,$5)",
      [linkId, date, timeSlot, username, status]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("保存失敗:", err);
    res.status(500).json({ error: "保存失敗" });
  }
});

// === 静的ファイル配信 (Reactビルド成果物) ===
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === サーバ起動 ===
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
