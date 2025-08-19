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
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "calendar",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL,
      title TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL CHECK (range_mode IN ('range', 'multiple')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shares (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL,
      username TEXT NOT NULL,
      responses JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB();

// === スケジュール登録（リンク発行） ===
app.post("/api/schedule", async (req, res) => {
  try {
    const { title, start_date, end_date, timeslot, range_mode } = req.body;
    const linkid = uuidv4();

    if (!["range", "multiple"].includes(range_mode)) {
      return res.status(400).json({ error: "range_mode は range または multiple のみ有効です" });
    }

    await pool.query(
      `INSERT INTO schedules (linkid, title, start_date, end_date, timeslot, range_mode) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [linkid, title, start_date, end_date, timeslot, range_mode]
    );

    res.json({ linkid, url: `/share/${linkid}` });
  } catch (err) {
    console.error("スケジュール登録エラー:", err);
    res.status(500).json({ error: "スケジュール登録に失敗しました" });
  }
});

// === スケジュール取得 ===
app.get("/api/schedule/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const result = await pool.query(
      `SELECT * FROM schedules WHERE linkid=$1`,
      [linkid]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 共有結果保存 ===
app.post("/api/share/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const { username, responses } = req.body;

    await pool.query(
      `INSERT INTO shares (linkid, username, responses) VALUES ($1, $2, $3)`,
      [linkid, username, responses]
    );

    const result = await pool.query(
      `SELECT * FROM shares WHERE linkid=$1 ORDER BY created_at ASC`,
      [linkid]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("共有保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 共有結果取得 ===
app.get("/api/share/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const result = await pool.query(
      `SELECT * FROM shares WHERE linkid=$1 ORDER BY created_at ASC`,
      [linkid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("共有取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 静的ファイル提供（本番用） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
