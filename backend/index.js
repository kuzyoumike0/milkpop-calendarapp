const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Railway の環境変数を使って接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ====== DB 初期化 ======
const initAllDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT,
      date DATE NOT NULL,
      selection_mode TEXT,
      time_type TEXT,
      start_time TEXT,
      end_time TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS personal_schedules (
      id SERIAL PRIMARY KEY,
      title TEXT,
      memo TEXT,
      date DATE NOT NULL,
      selection_mode TEXT,
      time_type TEXT,
      start_time TEXT,
      end_time TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS votes (
      id SERIAL PRIMARY KEY,
      schedule_id INT NOT NULL,
      username TEXT,
      choice TEXT CHECK (choice IN ('〇','△','✖')),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};
initAllDB();

// ====== API ======

// 確認用ルート
app.get("/api", (req, res) => {
  res.send("✅ MilkPOP Calendar API 稼働中");
});

// スケジュール保存
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, date, selectionMode, timeType, startTime, endTime } = req.body;
    const result = await pool.query(
      `INSERT INTO schedules (title, date, selection_mode, time_type, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, date, selectionMode, timeType, startTime, endTime]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB insert error" });
  }
});

// スケジュール一覧
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM schedules ORDER BY date ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB fetch error" });
  }
});

// 個人スケジュール保存
app.post("/api/personal-schedules", async (req, res) => {
  try {
    const { title, memo, date, selectionMode, timeType, startTime, endTime } = req.body;
    const result = await pool.query(
      `INSERT INTO personal_schedules (title, memo, date, selection_mode, time_type, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, memo, date, selectionMode, timeType, startTime, endTime]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB insert error" });
  }
});

// 個人スケジュール一覧
app.get("/api/personal-schedules", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM personal_schedules ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB fetch error" });
  }
});

// 投票保存
app.post("/api/votes", async (req, res) => {
  try {
    const { scheduleId, username, choice } = req.body;
    const result = await pool.query(
      `INSERT INTO votes (schedule_id, username, choice)
       VALUES ($1, $2, $3) RETURNING *`,
      [scheduleId, username, choice]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB insert error" });
  }
});

// 投票取得
app.get("/api/votes/:scheduleId", async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const result = await pool.query(
      `SELECT username, choice FROM votes WHERE schedule_id = $1`,
      [scheduleId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB fetch error" });
  }
});

// ====== React ビルドを配信 ======
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ====== サーバー起動 ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ MilkPOP Calendar running on port ${PORT}`);
});
