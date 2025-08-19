// backend/index.js
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB接続設定 ===
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

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkId TEXT,
      username TEXT,
      date DATE,
      timeslot TEXT
    );
  `);
}
initDB();

// === 共有リンク作成 ===
app.post("/api/links", async (req, res) => {
  const { title } = req.body;
  const id = uuidv4();
  try {
    await pool.query("INSERT INTO links (id, title) VALUES ($1, $2)", [id, title]);
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "リンク作成失敗" });
  }
});

// === リンク情報取得 ===
app.get("/api/links/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM links WHERE id=$1", [linkId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "リンクが存在しません" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "リンク取得失敗" });
  }
});

// === スケジュール登録（複数日まとめて） ===
app.post("/api/schedules/:linkId", async (req, res) => {
  const { linkId } = req.params;
  const { username, dates, timeslot } = req.body;

  if (!username || !Array.isArray(dates) || dates.length === 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    for (const date of dates) {
      await pool.query(
        "INSERT INTO schedules (linkId, username, date, timeslot) VALUES ($1, $2, $3, $4)",
        [linkId, username, date, timeslot]
      );
    }
    res.json({ message: "登録成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB insert failed" });
  }
});

// === スケジュール取得 ===
app.get("/api/schedules/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM schedules WHERE linkId=$1 ORDER BY date, timeslot",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB fetch failed" });
  }
});

// === 静的ファイル (React build) ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバ起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
