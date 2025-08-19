const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(cors());

// === PostgreSQL接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "calendar",
        password: process.env.DB_PASSWORD || "password",
        port: process.env.DB_PORT || 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      link_id TEXT REFERENCES links(id),
      date TEXT,
      timeslot TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      link_id TEXT REFERENCES links(id),
      date TEXT,
      timeslot TEXT,
      username TEXT,
      choice TEXT
    );
  `);
}
initDB();

// === API ===

// リンク作成
app.post("/api/create-link", async (req, res) => {
  const { title, schedules } = req.body;
  if (!title || !schedules || schedules.length === 0) {
    return res.status(400).json({ error: "タイトルとスケジュールが必要です" });
  }

  const id = uuidv4();

  try {
    await pool.query("INSERT INTO links (id, title) VALUES ($1, $2)", [id, title]);

    for (const s of schedules) {
      await pool.query(
        "INSERT INTO schedules (link_id, date, timeslot) VALUES ($1, $2, $3)",
        [id, s.date, s.timeslot]
      );
    }

    res.json({ linkId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "リンク作成失敗" });
  }
});

// リンク情報 + 回答一覧取得
app.get("/api/links/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const linkResult = await pool.query("SELECT * FROM links WHERE id=$1", [id]);
    if (linkResult.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }
    const link = linkResult.rows[0];

    const schedulesResult = await pool.query(
      "SELECT date, timeslot FROM schedules WHERE link_id=$1 ORDER BY date, timeslot",
      [id]
    );

    const responsesResult = await pool.query(
      "SELECT date, timeslot, username, choice FROM responses WHERE link_id=$1",
      [id]
    );

    // responses を { "date|timeslot": { username: choice } } 形式に整形
    const responses = {};
    for (const r of responsesResult.rows) {
      const key = `${r.date}|${r.timeslot}`;
      if (!responses[key]) responses[key] = {};
      responses[key][r.username] = r.choice;
    }

    res.json({
      title: link.title,
      schedules: schedulesResult.rows,
      responses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "リンク取得失敗" });
  }
});

// 回答登録（上書き）
app.post("/api/links/:id/schedules", async (req, res) => {
  const { id } = req.params;
  const { username, choices } = req.body;

  if (!username || !choices) {
    return res.status(400).json({ error: "ユーザー名と回答が必要です" });
  }

  try {
    // 既存回答を削除して再登録
    await pool.query("DELETE FROM responses WHERE link_id=$1 AND username=$2", [id, username]);

    for (const key of Object.keys(choices)) {
      const [date, timeslot] = key.split("|");
      const choice = choices[key];
      await pool.query(
        "INSERT INTO responses (link_id, date, timeslot, username, choice) VALUES ($1, $2, $3, $4, $5)",
        [id, date, timeslot, username, choice]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "回答保存失敗" });
  }
});

// === 静的ファイル（Reactビルド後） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
