const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// === PostgreSQL接続設定 ===
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

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
initDB();

// === Socket.IO ===
io.on("connection", (socket) => {
  console.log("🔌 ユーザー接続:", socket.id);

  // 部屋に参加（共有リンクごとに分ける）
  socket.on("join", (linkId) => {
    socket.join(linkId);
    console.log(`ユーザー ${socket.id} がルーム ${linkId} に参加`);
  });

  socket.on("disconnect", () => {
    console.log("❌ ユーザー切断:", socket.id);
  });
});

// === スケジュール保存API ===
app.post("/api/schedule", async (req, res) => {
  const { linkId, date, timeSlot, username, status } = req.body;

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

    // 🔥 ルームの全員に最新データを送信
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
    console.error("取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === フロント配信 ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
