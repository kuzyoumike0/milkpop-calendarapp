const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === DB 接続設定 ===
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

// === DB 初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      link_id TEXT NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      starttime TEXT,
      endtime TEXT,
      FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      link_id TEXT NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      username TEXT NOT NULL,
      choice TEXT NOT NULL CHECK (choice IN ('◯','×')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(link_id, date, timeslot, username),
      FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
    );
  `);
  console.log("✅ DB 初期化完了");
}

// === リンク作成 ===
app.post("/api/create-link", async (req, res) => {
  const { title, dates, timeslot, startTime, endTime } = req.body;
  if (!title || !dates || dates.length === 0) {
    return res.status(400).json({ error: "タイトルと日付が必須です" });
  }

  const linkId = uuidv4();

  try {
    await pool.query("INSERT INTO links (id, title) VALUES ($1, $2)", [
      linkId,
      title,
    ]);

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (link_id, date, timeslot, starttime, endtime)
         VALUES ($1, $2, $3, $4, $5)`,
        [linkId, d, timeslot, startTime, endTime]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === リンク取得（予定＋回答一覧） ===
app.get("/api/link/:id", async (req, res) => {
  const linkId = req.params.id;
  try {
    const linkRes = await pool.query("SELECT * FROM links WHERE id=$1", [
      linkId,
    ]);
    if (linkRes.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }

    const schedulesRes = await pool.query(
      "SELECT * FROM schedules WHERE link_id=$1 ORDER BY date ASC",
      [linkId]
    );
    const responsesRes = await pool.query(
      "SELECT * FROM responses WHERE link_id=$1 ORDER BY created_at ASC",
      [linkId]
    );

    res.json({
      title: linkRes.rows[0].title,
      schedules: schedulesRes.rows,
      responses: responsesRes.rows,
    });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).json({ error: "リンク取得に失敗しました" });
  }
});

// === 回答登録（INSERT OR UPDATE） ===
app.post("/api/respond", async (req, res) => {
  const { linkId, date, timeslot, username, choice } = req.body;
  if (!linkId || !date || !timeslot || !username || !choice) {
    return res.status(400).json({ error: "全ての項目が必須です" });
  }

  try {
    await pool.query(
      `INSERT INTO responses (link_id, date, timeslot, username, choice)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (link_id, date, timeslot, username)
       DO UPDATE SET choice = EXCLUDED.choice, created_at = CURRENT_TIMESTAMP`,
      [linkId, date, timeslot, username, choice]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("回答保存エラー:", err);
    res.status(500).json({ error: "回答保存に失敗しました" });
  }
});

// === 回答削除 ===
app.post("/api/delete-response", async (req, res) => {
  const { linkId, date, timeslot, username } = req.body;
  if (!linkId || !date || !timeslot || !username) {
    return res.status(400).json({ error: "全ての項目が必須です" });
  }

  try {
    await pool.query(
      `DELETE FROM responses WHERE link_id=$1 AND date=$2 AND timeslot=$3 AND username=$4`,
      [linkId, date, timeslot, username]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("回答削除エラー:", err);
    res.status(500).json({ error: "回答削除に失敗しました" });
  }
});

// === 静的ファイル配信 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === サーバー起動 ===
initDB().then(() => {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`🚀 サーバーはポート${PORT}で実行されています`);
  });
});
