const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// === Express 初期化 ===
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // 本番運用では Railway のドメインに限定推奨
});
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// === PostgreSQL 接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
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
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkId TEXT NOT NULL,
      date DATE NOT NULL,
      timeSlot TEXT NOT NULL,
      username TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      linkId TEXT PRIMARY KEY,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB().catch((err) => console.error("DB初期化エラー:", err));

// === Socket.IO 接続処理 ===
io.on("connection", (socket) => {
  console.log("🔌 ユーザー接続:", socket.id);

  socket.on("join", (linkId) => {
    socket.join(linkId);
    console.log(`ユーザー ${socket.id} がルーム ${linkId} に参加`);
  });

  socket.on("disconnect", () => {
    console.log("❌ ユーザー切断:", socket.id);
  });
});

// === リンク作成API ===
app.post("/api/create-link", async (req, res) => {
  try {
    const linkId = uuidv4();
    await pool.query("INSERT INTO links (linkId) VALUES ($1)", [linkId]);
    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === スケジュール保存API（保存後に即時反映） ===
app.post("/api/schedule", async (req, res) => {
  const { linkId, date, timeSlot, username, status } = req.body;

  if (!linkId || !date || !timeSlot || !username || !status) {
    return res.status(400).json({ error: "必須項目が不足しています" });
  }

  try {
    await pool.query(
      `INSERT INTO schedules (linkId, date, timeSlot, username, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [linkId, date, timeSlot, username, status]
    );

    const result = await pool.query(
      `SELECT * FROM schedules WHERE linkId = $1 ORDER BY date, timeSlot`,
      [linkId]
    );

    // 🔥 同じリンクを見ている全員に最新データを送信
    io.to(linkId).emit("updateSchedules", result.rows);

    res.json(result.rows);
  } catch (err) {
    console.error("スケジュール保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === スケジュール取得API ===
app.get("/api/schedules/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM schedules WHERE linkId = $1 ORDER BY date, timeSlot`,
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === フロントエンド配信 ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
