const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === PostgreSQL 接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
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
      answer BOOLEAN NOT NULL
    );
  `);

  console.log("✅ init.sql でデータベースを初期化しました");
}

// === 共有リンク作成 ===
app.post("/api/create-link", async (req, res) => {
  try {
    let { title, dates } = req.body;

    if (!Array.isArray(dates)) {
      if (dates && typeof dates === "string") {
        dates = [dates];
      } else {
        dates = [];
      }
    }

    if (dates.length === 0) {
      return res.status(400).send("❌ 日付が選択されていません");
    }

    const linkId = uuidv4();
    await pool.query("INSERT INTO links (id, title) VALUES ($1, $2)", [
      linkId,
      title || "無題",
    ]);

    for (const d of dates) {
      const parsed = new Date(d);
      if (!isNaN(parsed)) {
        await pool.query(
          "INSERT INTO schedules (link_id, date) VALUES ($1, $2)",
          [linkId, parsed.toISOString().split("T")[0]]
        );
      }
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).send("❌ リンク作成失敗: " + err.message);
  }
});

// === 共有リンクから日程一覧取得 ===
app.get("/api/link/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.id, s.date, r.username, r.answer
       FROM schedules s
       LEFT JOIN responses r ON s.id = r.schedule_id
       WHERE s.link_id = $1
       ORDER BY s.date ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).send("❌ 取得失敗: " + err.message);
  }
});

// === 回答登録 ===
app.post("/api/respond", async (req, res) => {
  try {
    const { scheduleId, username, answer } = req.body;
    if (!scheduleId || !username) {
      return res.status(400).send("❌ 必要なデータが不足しています");
    }

    await pool.query(
      `INSERT INTO responses (schedule_id, username, answer)
       VALUES ($1, $2, $3)`,
      [scheduleId, username, answer]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("回答登録エラー:", err);
    res.status(500).send("❌ 回答保存失敗: " + err.message);
  }
});

// === 静的ファイル配信（本番用） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 サーバーはポート ${PORT} で実行されています`);
  });
});
