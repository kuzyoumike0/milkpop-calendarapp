const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// =============================
// PostgreSQL 接続設定
// =============================
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || "db", // ← Dockerではサービス名
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "calendar",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

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

  console.log("✅ DB initialized");
}
initDB().catch((err) => console.error("DB初期化エラー:", err));

// =============================
// APIルート
// =============================

// 1. 新しい共有リンク作成
app.post("/api/create-link", async (req, res) => {
  try {
    const { title, schedules } = req.body;
    if (!title || !schedules || !Array.isArray(schedules)) {
      return res.status(400).json({ error: "タイトルとスケジュール配列が必要です" });
    }

    const linkId = uuidv4();
    await pool.query("INSERT INTO schedules (id, title) VALUES ($1, $2)", [
      linkId,
      title,
    ]);

    for (const s of schedules) {
      await pool.query(
        `INSERT INTO schedule_items (id, scheduleId, date, timeslot, starttime, endtime) 
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [uuidv4(), linkId, s.date, s.timeslot, s.starttime || null, s.endtime || null]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// 2. 共有リンクからデータ取得
app.get("/api/link/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    const scheduleRes = await pool.query(
      "SELECT * FROM schedules WHERE id=$1",
      [linkId]
    );
    if (scheduleRes.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }

    const itemsRes = await pool.query(
      "SELECT * FROM schedule_items WHERE scheduleId=$1 ORDER BY date, timeslot",
      [linkId]
    );
    const participantsRes = await pool.query(
      "SELECT * FROM participants WHERE scheduleId=$1",
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

// 3. 参加者の回答保存・更新
app.post("/api/participant", async (req, res) => {
  try {
    const { scheduleId, date, timeslot, username, status } = req.body;
    if (!scheduleId || !date || !timeslot || !username || !status) {
      return res.status(400).json({ error: "全ての項目が必要です" });
    }

    const existing = await pool.query(
      `SELECT * FROM participants 
       WHERE scheduleId=$1 AND date=$2 AND timeslot=$3 AND username=$4`,
      [scheduleId, date, timeslot, username]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE participants SET status=$1 WHERE id=$2",
        [status, existing.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO participants (id, scheduleId, date, timeslot, username, status)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [uuidv4(), scheduleId, date, timeslot, username, status]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("参加者追加/更新エラー:", err);
    res.status(500).json({ error: "参加者追加に失敗しました" });
  }
});

// 4. 参加者削除
app.delete("/api/participant", async (req, res) => {
  try {
    const { scheduleId, date, timeslot, username } = req.body;
    if (!scheduleId || !date || !timeslot || !username) {
      return res.status(400).json({ error: "全ての項目が必要です" });
    }

    await pool.query(
      `DELETE FROM participants 
       WHERE scheduleId=$1 AND date=$2 AND timeslot=$3 AND username=$4`,
      [scheduleId, date, timeslot, username]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("参加者削除エラー:", err);
    res.status(500).json({ error: "削除に失敗しました" });
  }
});

// =============================
// フロントエンドのビルドを提供
// =============================
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// =============================
// サーバー起動
// =============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
