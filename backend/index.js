const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(cors());

// === PostgreSQL 接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB 初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id SERIAL PRIMARY KEY,
      link_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      link_id TEXT REFERENCES links(link_id) ON DELETE CASCADE,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('〇', '×'))
    );
  `);
  console.log("✅ init.sql でデータベースを初期化しました");
}

// === API: リンク作成 ===
app.post("/api/create-link", async (req, res) => {
  try {
    const { title, dates } = req.body;
    if (!title || !dates || !Array.isArray(dates)) {
      return res.status(400).json({ error: "タイトルと日付が必須です" });
    }

    const linkId = uuidv4();

    await pool.query("INSERT INTO links (link_id, title) VALUES ($1, $2)", [
      linkId,
      title,
    ]);

    const specialSlots = ["全日", "昼", "夜"];

    for (const d of dates) {
      const dateValue = typeof d === "string" ? d : d.date;
      const timeslot = d.timeslot;

      if (!timeslot) {
        return res.status(400).json({
          error: `時間帯が未指定です (日付: ${dateValue})`,
        });
      }

      if (!specialSlots.includes(timeslot)) {
        if (!timeslot.includes("-")) {
          return res.status(400).json({
            error: `無効な時間帯: ${timeslot}`,
          });
        }

        const [start, end] = timeslot.split("-");
        if (start >= end) {
          return res.status(400).json({
            error: `無効な時間帯: ${timeslot} （開始は終了より前でなければなりません）`,
          });
        }
      }

      await pool.query(
        "INSERT INTO schedules (link_id, date, timeslot) VALUES ($1, $2, $3)",
        [linkId, dateValue, timeslot]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === API: リンク情報取得 ===
app.get("/api/link/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const linkResult = await pool.query(
      "SELECT * FROM links WHERE link_id=$1",
      [linkId]
    );
    if (linkResult.rows.length === 0) {
      return res.status(404).json({ error: "リンクが見つかりません" });
    }

    const schedules = await pool.query(
      "SELECT * FROM schedules WHERE link_id=$1 ORDER BY date ASC",
      [linkId]
    );

    res.json({
      title: linkResult.rows[0].title,
      schedules: schedules.rows,
    });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).json({ error: "リンク取得に失敗しました" });
  }
});

// === API: 回答登録 ===
app.post("/api/respond", async (req, res) => {
  try {
    const { scheduleId, username, status } = req.body;
    if (!scheduleId || !username || !status) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    await pool.query(
      `INSERT INTO responses (schedule_id, username, status) 
       VALUES ($1, $2, $3)`,
      [scheduleId, username, status]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("回答登録エラー:", err);
    res.status(500).json({ error: "回答登録に失敗しました" });
  }
});

// === API: 回答一覧取得 ===
app.get("/api/responses/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    const responses = await pool.query(
      `
      SELECT r.id, r.schedule_id, r.username, r.status, s.date, s.timeslot
      FROM responses r
      JOIN schedules s ON r.schedule_id = s.id
      WHERE s.link_id = $1
      ORDER BY s.date ASC, r.username ASC
      `,
      [linkId]
    );

    res.json(responses.rows);
  } catch (err) {
    console.error("回答一覧取得エラー:", err);
    res.status(500).json({ error: "回答一覧取得に失敗しました" });
  }
});

// === 静的ファイル配信 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === サーバー起動 ===
app.listen(PORT, async () => {
  await initDB();
  console.log(`🚀 サーバーはポート ${PORT} で実行されています`);
});
