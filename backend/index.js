const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
        port: process.env.DB_PORT || 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      linkId UUID NOT NULL UNIQUE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedule_items (
      id UUID PRIMARY KEY,
      scheduleId UUID REFERENCES schedules(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      starttime INT,
      endtime INT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS participants (
      id UUID PRIMARY KEY,
      scheduleId UUID REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);
}
initDB().catch((err) => console.error("DB初期化エラー:", err));

// === API実装 ===

// 新しいスケジュール作成
app.post("/api/create-link", async (req, res) => {
  try {
    const { title, schedules } = req.body;
    const scheduleId = uuidv4();
    const linkId = uuidv4();

    await pool.query(
      `INSERT INTO schedules (id, title, linkId) VALUES ($1, $2, $3)`,
      [scheduleId, title, linkId]
    );

    if (Array.isArray(schedules)) {
      for (const s of schedules) {
        await pool.query(
          `INSERT INTO schedule_items (id, scheduleId, date, timeslot, starttime, endtime)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), scheduleId, s.date, s.timeslot, s.startTime, s.endTime]
        );
      }
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成失敗" });
  }
});

// リンクからスケジュール取得
app.get("/api/link/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    const scheduleRes = await pool.query(
      `SELECT * FROM schedules WHERE linkId = $1`,
      [linkId]
    );
    if (scheduleRes.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }

    const schedule = scheduleRes.rows[0];

    const itemsRes = await pool.query(
      `SELECT * FROM schedule_items WHERE scheduleId = $1 ORDER BY date, timeslot`,
      [schedule.id]
    );
    const participantsRes = await pool.query(
      `SELECT * FROM participants WHERE scheduleId = $1`,
      [schedule.id]
    );

    res.json({
      title: schedule.title,
      schedules: itemsRes.rows,
      responses: participantsRes.rows,
    });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// 回答登録（追加・更新）
app.post("/api/participant", async (req, res) => {
  try {
    const { scheduleId, date, timeslot, username, status } = req.body;
    const id = uuidv4();

    // すでに回答がある場合は更新
    const existing = await pool.query(
      `SELECT * FROM participants WHERE scheduleId = $1 AND date = $2 AND timeslot = $3 AND username = $4`,
      [scheduleId, date, timeslot, username]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE participants SET status = $1 WHERE id = $2`,
        [status, existing.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO participants (id, scheduleId, date, timeslot, username, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, scheduleId, date, timeslot, username, status]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("参加者追加エラー:", err);
    res.status(500).json({ error: "参加者追加失敗" });
  }
});

// 回答削除
app.delete("/api/participant", async (req, res) => {
  try {
    const { scheduleId, date, timeslot, username } = req.body;

    await pool.query(
      `DELETE FROM participants WHERE scheduleId = $1 AND date = $2 AND timeslot = $3 AND username = $4`,
      [scheduleId, date, timeslot, username]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("回答削除エラー:", err);
    res.status(500).json({ error: "削除失敗" });
  }
});

// === 本番環境: React ビルド配信 ===
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
  );
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
