const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
      linkId UUID NOT NULL
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
initDB();

// === スケジュール作成 ===
app.post("/api/schedule", async (req, res) => {
  try {
    const { title, schedules } = req.body;
    if (!title || !Array.isArray(schedules)) {
      return res.status(400).json({ error: "タイトルとスケジュール配列が必要です" });
    }

    const scheduleId = uuidv4();
    const linkId = uuidv4();

    await pool.query(
      "INSERT INTO schedules (id, title, linkId) VALUES ($1, $2, $3)",
      [scheduleId, title, linkId]
    );

    for (const s of schedules) {
      await pool.query(
        "INSERT INTO schedule_items (id, scheduleId, date, timeslot, starttime, endtime) VALUES ($1, $2, $3, $4, $5, $6)",
        [uuidv4(), scheduleId, s.date, s.timeslot, s.starttime || null, s.endtime || null]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === リンク取得 ===
app.get("/api/link/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    const scheduleRes = await pool.query("SELECT * FROM schedules WHERE linkId=$1", [linkId]);
    if (scheduleRes.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }
    const schedule = scheduleRes.rows[0];

    const itemsRes = await pool.query("SELECT * FROM schedule_items WHERE scheduleId=$1", [
      schedule.id,
    ]);

    const participantsRes = await pool.query("SELECT * FROM participants WHERE scheduleId=$1", [
      schedule.id,
    ]);

    res.json({
      title: schedule.title,
      schedules: itemsRes.rows,
      responses: participantsRes.rows,
    });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).json({ error: "リンク取得に失敗しました" });
  }
});

// === 個別回答保存 ===
app.post("/api/participant", async (req, res) => {
  try {
    const { scheduleId, date, timeslot, username, status } = req.body;

    if (!scheduleId || !date || !timeslot || !username || !status) {
      return res.status(400).json({ error: "必要なデータが不足しています" });
    }

    await pool.query(
      `DELETE FROM participants WHERE scheduleId=$1 AND username=$2 AND date=$3 AND timeslot=$4`,
      [scheduleId, username, date, timeslot]
    );

    await pool.query(
      "INSERT INTO participants (id, scheduleId, username, date, timeslot, status) VALUES ($1,$2,$3,$4,$5,$6)",
      [uuidv4(), scheduleId, username, date, timeslot, status]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("参加者追加エラー:", err);
    res.status(500).json({ error: "参加者追加に失敗しました" });
  }
});

// === 回答削除 ===
app.delete("/api/participant", async (req, res) => {
  try {
    const { scheduleId, date, timeslot, username } = req.body;

    await pool.query(
      `DELETE FROM participants WHERE scheduleId=$1 AND username=$2 AND date=$3 AND timeslot=$4`,
      [scheduleId, username, date, timeslot]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("回答削除エラー:", err);
    res.status(500).json({ error: "削除に失敗しました" });
  }
});

// === 一括保存 (保存ボタン用) ===
app.put("/api/participant/bulk", async (req, res) => {
  try {
    const { linkId, username, updates } = req.body;

    const scheduleRes = await pool.query("SELECT * FROM schedules WHERE linkId=$1", [linkId]);
    if (scheduleRes.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }
    const scheduleId = scheduleRes.rows[0].id;

    for (const { date, timeslot, choice } of updates) {
      await pool.query(
        `DELETE FROM participants WHERE scheduleId=$1 AND username=$2 AND date=$3 AND timeslot=$4`,
        [scheduleId, username, date, timeslot]
      );

      if (choice) {
        await pool.query(
          "INSERT INTO participants (id, scheduleId, username, date, timeslot, status) VALUES ($1,$2,$3,$4,$5,$6)",
          [uuidv4(), scheduleId, username, date, timeslot, choice]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("一括保存エラー:", err);
    res.status(500).json({ error: "一括保存に失敗しました" });
  }
});

// === 静的ファイル（本番用） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === サーバ起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
