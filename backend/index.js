const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");

// === DB接続設定 ===
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

// === アプリ初期化 ===
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(bodyParser.json());

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkid TEXT,
      date DATE,
      timemode TEXT,
      starthour INT,
      endhour INT,
      title TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      scheduleid INT REFERENCES schedules(id) ON DELETE CASCADE,
      name TEXT,
      status TEXT
    );
  `);
}
initDB();

// === 共有リンク作成 ===
app.post("/api/create-link", async (req, res) => {
  try {
    const { schedules } = req.body;
    const linkid = uuidv4();

    for (const s of schedules) {
      await pool.query(
        `INSERT INTO schedules (linkid, date, timemode, starthour, endhour, title)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [linkid, s.date, s.timemode, s.starthour, s.endhour, s.title]
      );
    }

    res.json({ linkid });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === スケジュール取得 ===
app.get("/api/share/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const result = await pool.query(
      `SELECT * FROM schedules WHERE linkid=$1 ORDER BY date ASC`,
      [linkid]
    );

    const schedules = [];
    for (const row of result.rows) {
      const resp = await pool.query(
        `SELECT name, status FROM responses WHERE scheduleid=$1`,
        [row.id]
      );
      schedules.push({
        ...row,
        responses: resp.rows,
      });
    }

    res.json(schedules);
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 出欠登録 ===
app.post("/api/share/:linkid/respond", async (req, res) => {
  try {
    const { linkid } = req.params;
    const { scheduleId, name, status } = req.body;

    // 同じ人が既に回答していたら更新、なければ追加
    const existing = await pool.query(
      `SELECT * FROM responses WHERE scheduleid=$1 AND name=$2`,
      [scheduleId, name]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE responses SET status=$1 WHERE scheduleid=$2 AND name=$3`,
        [status, scheduleId, name]
      );
    } else {
      await pool.query(
        `INSERT INTO responses (scheduleid, name, status) VALUES ($1,$2,$3)`,
        [scheduleId, name, status]
      );
    }

    io.emit("update");
    res.json({ success: true });
  } catch (err) {
    console.error("登録エラー:", err);
    res.status(500).json({ error: "登録に失敗しました" });
  }
});

// === 静的ファイル配信（フロントエンドビルド済み） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
