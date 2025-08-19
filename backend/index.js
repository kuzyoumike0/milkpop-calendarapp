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
app.use(express.static(path.join(__dirname, "../frontend/build")));

// === PostgreSQL 接続設定 ===
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
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS share_links (
        id SERIAL PRIMARY KEY,
        linkid TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        linkid TEXT REFERENCES share_links(linkid) ON DELETE CASCADE,
        date DATE NOT NULL,
        timeslot TEXT NOT NULL,
        starttime TEXT,
        endtime TEXT
      );

      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
        username TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('yes', 'no'))
      );
    `);
    console.log("✅ DB初期化完了");
  } catch (err) {
    console.error("❌ DB初期化エラー:", err);
  } finally {
    client.release();
  }
}
initDB();

// === API ===

// 共有リンク作成
app.post("/api/create-link", async (req, res) => {
  const client = await pool.connect();
  try {
    const { title, dates, timeslot, startTime, endTime } = req.body;
    const linkId = uuidv4();

    await client.query("BEGIN");

    await client.query(
      "INSERT INTO share_links (linkid, title) VALUES ($1, $2)",
      [linkId, title]
    );

    for (const d of dates) {
      const dateStr = typeof d === "string" ? d : d.date;

      await client.query(
        "INSERT INTO schedules (linkid, date, timeslot, starttime, endtime) VALUES ($1, $2, $3, $4, $5)",
        [
          linkId,
          dateStr,
          d.timeslot || timeslot,
          d.startTime || startTime,
          d.endTime || endTime,
        ]
      );
    }

    await client.query("COMMIT");
    res.json({ linkId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  } finally {
    client.release();
  }
});

// 共有リンク取得
app.get("/api/link/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const schedules = await pool.query(
      "SELECT * FROM schedules WHERE linkid=$1 ORDER BY date ASC",
      [linkId]
    );

    const participants = await pool.query(
      `SELECT p.*, s.date, s.timeslot 
       FROM participants p 
       JOIN schedules s ON p.schedule_id = s.id 
       WHERE s.linkid=$1`,
      [linkId]
    );

    res.json({ schedules: schedules.rows, participants: participants.rows });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).json({ error: "リンク取得に失敗しました" });
  }
});

// 参加者追加
app.post("/api/participant", async (req, res) => {
  const { scheduleId, username, status } = req.body;
  try {
    await pool.query(
      "INSERT INTO participants (schedule_id, username, status) VALUES ($1, $2, $3)",
      [scheduleId, username, status]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("参加者追加エラー:", err);
    res.status(500).json({ error: "参加者追加に失敗しました" });
  }
});

// 参加者編集
app.put("/api/participant/:id", async (req, res) => {
  const { id } = req.params;
  const { username, status } = req.body;
  try {
    await pool.query(
      "UPDATE participants SET username=$1, status=$2 WHERE id=$3",
      [username, status, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("参加者編集エラー:", err);
    res.status(500).json({ error: "参加者編集に失敗しました" });
  }
});

// 参加者削除
app.delete("/api/participant/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM participants WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("参加者削除エラー:", err);
    res.status(500).json({ error: "参加者削除に失敗しました" });
  }
});

// React フロントのルーティング対応
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀サーバーはポート${PORT}で実行されています`);
});
