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
      memo TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      mode TEXT NOT NULL, -- 範囲選択 or 複数選択
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      linkid TEXT
    );

    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB();

// === スケジュール登録 ===
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, memo, start_date, end_date, timeslot, mode } = req.body;
    const linkid = uuidv4();
    const result = await pool.query(
      `INSERT INTO schedules (title, memo, start_date, end_date, timeslot, mode, linkid)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, memo, start_date, end_date, timeslot, mode, linkid]
    );
    res.json({ success: true, schedule: result.rows[0], url: `/share/${linkid}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "登録に失敗しました" });
  }
});

// === 共有リンクから取得 ===
app.get("/api/share/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const result = await pool.query("SELECT * FROM schedules WHERE linkid=$1", [linkid]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 応答保存 ===
app.post("/api/responses", async (req, res) => {
  try {
    const { schedule_id, username, response } = req.body;
    await pool.query(
      `INSERT INTO responses (schedule_id, username, response) VALUES ($1,$2,$3)`,
      [schedule_id, username, response]
    );
    const responses = await pool.query(
      "SELECT * FROM responses WHERE schedule_id=$1 ORDER BY created_at DESC",
      [schedule_id]
    );
    res.json(responses.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 静的ファイル ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
