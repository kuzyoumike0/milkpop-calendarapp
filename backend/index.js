const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// =============================
// PostgreSQL 接続設定（Railway対応）
// =============================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // RailwayのPostgresはSSL必須
  },
});

// =============================
// DB初期化
// =============================
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL
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
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      username TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);

  console.log("✅ Database initialized");
}
initDB().catch((err) => {
  console.error("❌ DB初期化エラー:", err);
});

// =============================
// APIルート
// =============================

// 共有リンク作成
app.post("/api/create-link", async (req, res) => {
  try {
    const { title, schedules } = req.body;
    const scheduleId = uuidv4();

    await pool.query("INSERT INTO schedules (id, title) VALUES ($1, $2)", [
      scheduleId,
      title,
    ]);

    if (Array.isArray(schedules)) {
      for (const s of schedules) {
        await pool.query(
          "INSERT INTO schedule_items (id, scheduleId, date, timeslot, starttime, endtime) VALUES ($1,$2,$3,$4,$5,$6)",
          [uuidv4(), scheduleId, s.date, s.timeslot, s.starttime, s.endtime]
        );
      }
    }

    res.json({ linkId: scheduleId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// 共有リンク取得
app.get("/api/link/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    const scheduleRes = await pool.query(
      "SELECT * FROM schedules WHERE id = $1",
      [linkId]
    );
    if (scheduleRes.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }

    const itemsRes = await pool.query(
      "SELECT * FROM schedule_items WHERE scheduleId = $1 ORDER BY date, timeslot",
      [linkId]
    );

    const participantsRes = await pool.query(
      "SELECT * FROM participants WHERE scheduleId = $1",
      [linkId]
    );

    res.json({
      title: scheduleRes.rows[0].title,
      schedules: itemsRes.rows,
      responses: participantsRes.rows,
    });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).json({ error: "リンク取得に失敗しました" });
  }
});

// 参加者追加・編集
app.post("/api/participant", async (req, res) => {
  try {
    const { scheduleId, date, timeslot, username, status } = req.body;

    // 既存を削除してから挿入（上書き）
    await pool.query(
      "DELETE FROM participants WHERE scheduleId=$1 AND date=$2 AND timeslot=$3 AND username=$4",
      [scheduleId, date, timeslot, username]
    );

    await pool.query(
      "INSERT INTO participants (id, scheduleId, date, timeslot, username, status) VALUES ($1,$2,$3,$4,$5,$6)",
      [uuidv4(), scheduleId, date, timeslot, username, status]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("参加者追加エラー:", err);
    res.status(500).json({ error: "参加者追加に失敗しました" });
  }
});

// 参加者削除
app.delete("/api/participant", async (req, res) => {
  try {
    const { scheduleId, date, timeslot, username } = req.body;

    await pool.query(
      "DELETE FROM participants WHERE scheduleId=$1 AND date=$2 AND timeslot=$3 AND username=$4",
      [scheduleId, date, timeslot, username]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("参加者削除エラー:", err);
    res.status(500).json({ error: "参加者削除に失敗しました" });
  }
});

// =============================
// React フロントエンド対応
// =============================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// =============================
// サーバー起動
// =============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
