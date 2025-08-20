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
      title TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      linkid UUID NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      linkid UUID NOT NULL,
      username TEXT NOT NULL,
      schedule_id INT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB();

// === スケジュール登録 (共有用リンク発行) ===
app.post("/api/schedule", async (req, res) => {
  try {
    const { title, start_date, end_date, timeslot, range_mode } = req.body;

    if (!title || !start_date || !end_date || !timeslot || !range_mode) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    const linkid = uuidv4();
    await pool.query(
      `INSERT INTO schedules (title, start_date, end_date, timeslot, range_mode, linkid)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, start_date, end_date, timeslot, range_mode, linkid]
    );

    res.json({ link: `/share/${linkid}` });
  } catch (err) {
    console.error("Error inserting schedule:", err);
    res.status(500).json({ error: "スケジュール登録に失敗しました" });
  }
});

// === スケジュール取得 ===
app.get("/api/schedule/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const result = await pool.query(
      `SELECT * FROM schedules WHERE linkid = $1`,
      [linkid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching schedule:", err);
    res.status(500).json({ error: "スケジュール取得に失敗しました" });
  }
});

// === 共有リンク一覧 ===
app.get("/api/sharelinks", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT linkid, title FROM schedules ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching sharelinks:", err);
    res.status(500).json({ error: "リンク一覧取得に失敗しました" });
  }
});

// === 〇✖ 登録 ===
app.post("/api/response", async (req, res) => {
  try {
    const { linkid, username, responses } = req.body;
    if (!linkid || !username || !Array.isArray(responses)) {
      return res.status(400).json({ error: "入力が不足しています" });
    }

    // 既存削除してから再登録
    await pool.query(
      `DELETE FROM responses WHERE linkid=$1 AND username=$2`,
      [linkid, username]
    );

    for (const r of responses) {
      await pool.query(
        `INSERT INTO responses (linkid, username, schedule_id, status)
         VALUES ($1, $2, $3, $4)`,
        [linkid, username, r.schedule_id, r.status]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error inserting response:", err);
    res.status(500).json({ error: "回答登録に失敗しました" });
  }
});

// === レスポンス取得 ===
app.get("/api/response/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const result = await pool.query(
      `SELECT * FROM responses WHERE linkid=$1`,
      [linkid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching responses:", err);
    res.status(500).json({ error: "回答取得に失敗しました" });
  }
});

// === React の静的ファイルを配信 ===
const frontendPath = path.join(__dirname, "public");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
