const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

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
      dates DATE[] NOT NULL,
      timeslot TEXT NOT NULL,
      range_mode TEXT NOT NULL,
      username TEXT,
      link_id TEXT
    )
  `);
}
initDB();

// === 日程登録 ===
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, memo, dates, timeslot, range_mode, username } = req.body;
    if (!dates || dates.length === 0) {
      return res.status(400).json({ error: "日付が必要です" });
    }

    // 同じユーザー名なら更新扱い
    if (username) {
      const existing = await pool.query(
        "SELECT id FROM schedules WHERE username=$1",
        [username]
      );
      if (existing.rows.length > 0) {
        await pool.query(
          "UPDATE schedules SET title=$1, memo=$2, dates=$3, timeslot=$4, range_mode=$5 WHERE username=$6",
          [title, memo, dates, timeslot, range_mode, username]
        );
        return res.json({ message: "更新しました" });
      }
    }

    await pool.query(
      "INSERT INTO schedules (title, memo, dates, timeslot, range_mode, username) VALUES ($1,$2,$3,$4,$5,$6)",
      [title, memo, dates, timeslot, range_mode, username]
    );
    res.json({ message: "保存しました" });
  } catch (err) {
    console.error("登録エラー:", err);
    res.status(500).json({ error: "登録失敗" });
  }
});

// === 共有リンク作成 ===
app.post("/api/share", async (req, res) => {
  try {
    const linkId = uuidv4();
    const { title, dates, timeslot, range_mode } = req.body;

    await pool.query(
      "INSERT INTO schedules (title, dates, timeslot, range_mode, link_id) VALUES ($1,$2,$3,$4,$5)",
      [title, dates, timeslot, range_mode, linkId]
    );

    res.json({ url: `/share/${linkId}` });
  } catch (err) {
    console.error("共有リンク作成エラー:", err);
    res.status(500).json({ error: "共有リンク作成失敗" });
  }
});

// === 共有リンクから取得 ===
app.get("/api/share/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      "SELECT * FROM schedules WHERE link_id=$1",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// === 本番用フロントエンド ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
