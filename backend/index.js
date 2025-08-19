const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(bodyParser.json());

// ===== PostgreSQL 接続設定 =====
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
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// ===== DB初期化 =====
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkid TEXT,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      timemode TEXT NOT NULL,
      starthour TEXT,
      endhour TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sharelinks (
      linkid TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initDB();

// ===== Socket.IO =====
io.on("connection", (socket) => {
  console.log("ユーザー接続:", socket.id);
  socket.on("disconnect", () => {
    console.log("切断:", socket.id);
  });
});

// ===== API: スケジュール登録 =====
app.post("/api/schedules", async (req, res) => {
  try {
    const { dates, title, timemode, starthour, endhour } = req.body;
    if (!dates || dates.length === 0) {
      return res.status(400).json({ error: "日付が必要です" });
    }

    const linkid = "global"; // 共有リンク発行前は共通領域に保存

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (linkid, date, title, timemode, starthour, endhour)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [linkid, d, title, timemode, starthour, endhour]
      );
    }

    io.emit("update");
    res.json({ success: true });
  } catch (err) {
    console.error("登録エラー:", err);
    res.status(500).json({ error: "登録に失敗しました" });
  }
});

// ===== API: 登録済みスケジュール取得 =====
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM schedules WHERE linkid = 'global' ORDER BY date`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// ===== API: 共有リンク発行 =====
app.post("/api/share", async (req, res) => {
  try {
    const linkId = uuidv4();

    await pool.query(
      `INSERT INTO sharelinks (linkid) VALUES ($1)`,
      [linkId]
    );

    // 既存の global スケジュールをコピー
    await pool.query(
      `UPDATE schedules SET linkid = $1 WHERE linkid = 'global'`,
      [linkId]
    );

    io.emit("update");
    res.json({ linkId });
  } catch (err) {
    console.error("リンク発行エラー:", err);
    res.status(500).json({ error: "リンク発行に失敗しました" });
  }
});

// ===== API: 特定リンクのスケジュール取得 =====
app.get("/api/share/:linkid", async (req, res) => {
  try {
    const { linkid } = req.params;
    const result = await pool.query(
      `SELECT * FROM schedules WHERE linkid = $1 ORDER BY date`,
      [linkid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("共有リンク取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// ===== 静的ファイル配信 (React) =====
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
