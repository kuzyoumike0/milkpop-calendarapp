const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

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
        port: process.env.DB_PORT || 5432,
      }
);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedule_links (
      linkId TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      dates TEXT[] NOT NULL,
      mode TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedule_entries (
      id SERIAL PRIMARY KEY,
      linkId TEXT REFERENCES schedule_links(linkId) ON DELETE CASCADE,
      date TEXT NOT NULL,
      username TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);
}
initDB();

// === 共有リンク発行 ===
app.post("/api/schedule-link", async (req, res) => {
  const { title, dates, mode } = req.body;
  const linkId = uuidv4();

  try {
    await pool.query(
      `INSERT INTO schedule_links (linkId, title, dates, mode) VALUES ($1, $2, $3, $4)`,
      [linkId, title, dates, mode]
    );
    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成失敗:", err);
    res.status(500).json({ error: "リンク作成失敗" });
  }
});

// === スケジュール取得 ===
app.get("/api/schedules/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const linkRes = await pool.query(
      `SELECT * FROM schedule_links WHERE linkId = $1`,
      [linkId]
    );
    if (linkRes.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }

    const entryRes = await pool.query(
      `SELECT date, username, status FROM schedule_entries WHERE linkId = $1`,
      [linkId]
    );

    res.json({
      title: linkRes.rows[0].title,
      dates: linkRes.rows[0].dates,
      mode: linkRes.rows[0].mode,
      entries: entryRes.rows,
    });
  } catch (err) {
    console.error("取得失敗:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// === 出欠登録 ===
app.post("/api/schedule/:linkId", async (req, res) => {
  const { linkId } = req.params;
  const { date, username, status } = req.body;

  try {
    await pool.query(
      `INSERT INTO schedule_entries (linkId, date, username, status) VALUES ($1, $2, $3, $4)`,
      [linkId, date, username, status]
    );

    // 更新後のデータを取得して全員に送信
    const entryRes = await pool.query(
      `SELECT date, username, status FROM schedule_entries WHERE linkId = $1`,
      [linkId]
    );
    io.to(linkId).emit("updateSchedules", entryRes.rows);

    res.json({ success: true });
  } catch (err) {
    console.error("保存失敗:", err);
    res.status(500).json({ error: "保存失敗" });
  }
});

// === Socket.io ===
io.on("connection", (socket) => {
  console.log("クライアント接続:", socket.id);

  socket.on("join", (linkId) => {
    socket.join(linkId);
    console.log(`ルーム参加: ${linkId}`);
  });

  socket.on("disconnect", () => {
    console.log("切断:", socket.id);
  });
});

// === フロントエンドを返す ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
