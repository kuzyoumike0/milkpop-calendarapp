const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

// === Express サーバー設定 ===
const app = express();
const PORT = process.env.PORT || 8080;

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
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
      date DATE NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      answer TEXT NOT NULL CHECK (answer IN ('○','×'))
    );
  `);

  console.log("✅ init.sql でデータベースを初期化しました");
}

// === API ===

// 共有リンク作成
app.post("/api/create-link", async (req, res) => {
  try {
    let { title, dates } = req.body;

    // dates が配列でない場合は強制的に配列化
    if (!Array.isArray(dates)) {
      if (dates) {
        dates = [dates];
      } else {
        dates = [];
      }
    }

    if (dates.length === 0) {
      return res.status(400).send("日付が選択されていません");
    }

    const linkId = uuidv4();
    await pool.query("INSERT INTO links (id, title) VALUES ($1, $2)", [
      linkId,
      title || "無題",
    ]);

    for (const d of dates) {
      if (isNaN(new Date(d))) continue; // 無効な日付はスキップ
      await pool.query(
        "INSERT INTO schedules (link_id, date) VALUES ($1, $2)",
        [linkId, d]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).send("リンク作成失敗");
  }
});

// 共有リンクの内容取得
app.get("/api/link/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const linkRes = await pool.query("SELECT * FROM links WHERE id = $1", [
      linkId,
    ]);

    if (linkRes.rows.length === 0) {
      return res.status(404).send("リンクが存在しません");
    }

    const schedulesRes = await pool.query(
      "SELECT * FROM schedules WHERE link_id = $1 ORDER BY date",
      [linkId]
    );

    res.json({
      title: linkRes.rows[0].title,
      schedules: schedulesRes.rows,
    });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).send("取得失敗");
  }
});

// 回答登録
app.post("/api/response", async (req, res) => {
  try {
    const { scheduleId, username, answer } = req.body;
    if (!scheduleId || !username || !answer) {
      return res.status(400).send("必要なデータが不足しています");
    }

    await pool.query(
      `INSERT INTO responses (schedule_id, username, answer)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [scheduleId, username, answer]
    );

    res.send("回答を登録しました");
  } catch (err) {
    console.error("回答登録エラー:", err);
    res.status(500).send("登録失敗");
  }
});

// 回答一覧取得
app.get("/api/responses/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    const result = await pool.query(
      `SELECT s.date, r.username, r.answer
       FROM responses r
       JOIN schedules s ON r.schedule_id = s.id
       WHERE s.link_id = $1
       ORDER BY s.date, r.username`,
      [linkId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("回答一覧取得エラー:", err);
    res.status(500).send("取得失敗");
  }
});

// 静的ファイル配信（本番用）
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// サーバー開始
app.listen(PORT, async () => {
  console.log(`🚀 サーバーはポート ${PORT} で実行されています`);
  await initDB();
});
