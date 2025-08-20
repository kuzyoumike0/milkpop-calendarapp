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
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      linkid TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT NOT NULL,
      username TEXT NOT NULL,
      response TEXT NOT NULL
    )
  `);
}
initDB();

// === 個人スケジュール ===
app.get("/api/personal", async (req, res) => {
  const result = await pool.query("SELECT * FROM schedules WHERE linkid IS NULL ORDER BY date ASC");
  res.json(result.rows);
});

app.post("/api/personal", async (req, res) => {
  const { title, memo, dates, timeslot } = req.body;
  for (let d of dates) {
    await pool.query(
      "INSERT INTO schedules (title, memo, date, timeslot, range_mode) VALUES ($1,$2,$3,$4,$5)",
      [title, memo, d, timeslot, "multi"]
    );
  }
  res.json({ success: true });
});

// === 共有スケジュール作成 ===
app.post("/api/schedules", async (req, res) => {
  const { title, dates, timeslot } = req.body;
  const linkid = uuidv4();
  for (let d of dates) {
    await pool.query(
      "INSERT INTO schedules (title, date, timeslot, range_mode, linkid) VALUES ($1,$2,$3,$4,$5)",
      [title, d, timeslot, "multi", linkid]
    );
  }
  res.json({ link: `/share/${linkid}` });
});

app.get("/api/schedules/:linkid", async (req, res) => {
  const { linkid } = req.params;
  const result = await pool.query("SELECT * FROM schedules WHERE linkid=$1 ORDER BY date ASC", [linkid]);
  res.json(result.rows);
});

// === 共有ページ回答 ===
app.get("/api/shared/:linkid", async (req, res) => {
  const { linkid } = req.params;
  const schedules = await pool.query("SELECT * FROM schedules WHERE linkid=$1 ORDER BY date ASC", [linkid]);
  const responses = await pool.query("SELECT * FROM shared_responses");
  res.json({ schedules: schedules.rows, responses: responses.rows });
});

app.post("/api/shared", async (req, res) => {
  const { responses } = req.body;
  for (let r of responses) {
    await pool.query(
      "INSERT INTO shared_responses (schedule_id, username, response) VALUES ($1,$2,$3)",
      [r.schedule_id, r.username, r.response]
    );
  }
  res.json({ success: true });
});

// === 静的ファイル（フロントエンド） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
