const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// === DB 初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      timemode TEXT NOT NULL,
      starthour TEXT,
      endhour TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      linkid TEXT NOT NULL,
      date DATE NOT NULL,
      timemode TEXT NOT NULL,
      username TEXT NOT NULL,
      response TEXT NOT NULL
    );
  `);
}
initDB();

// === 1. 共有リンク発行 ===
app.post("/api/createLink", async (req, res) => {
  const { dates, title, timeMode, startHour, endHour } = req.body;
  if (!dates || dates.length === 0) {
    return res.status(400).json({ error: "日程が選択されていません" });
  }
  if (!title) {
    return res.status(400).json({ error: "タイトルが必要です" });
  }

  try {
    const client = await pool.connect();
    const linkId = uuidv4();

    for (const date of dates) {
      await client.query(
        `
        INSERT INTO schedules (linkid, title, date, timemode, starthour, endhour)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [
          linkId,
          title,
          date,
          timeMode,
          timeMode === "時間指定" ? startHour : null,
          timeMode === "時間指定" ? endHour : null,
        ]
      );
    }

    client.release();
    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// === 2. 共有ページデータ取得 ===
app.get("/api/link/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM schedules WHERE linkid=$1 ORDER BY date ASC",
      [linkId]
    );
    const responses = await pool.query(
      "SELECT * FROM responses WHERE linkid=$1",
      [linkId]
    );
    res.json({ schedules: result.rows, responses: responses.rows });
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "データ取得に失敗しました" });
  }
});

// === 3. 出欠登録 ===
app.post("/api/respond", async (req, res) => {
  const { linkId, date, timemode, username, response } = req.body;
  if (!linkId || !date || !timemode || !username || !response) {
    return res.status(400).json({ error: "必要なデータが不足しています" });
  }

  try {
    await pool.query(
      `
      INSERT INTO responses (linkid, date, timemode, username, response)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
    `,
      [linkId, date, timemode, username, response]
    );

    // リアルタイム反映
    io.to(linkId).emit("responseUpdated", { linkId });

    res.json({ success: true });
  } catch (err) {
    console.error("出欠登録エラー:", err);
    res.status(500).json({ error: "登録に失敗しました" });
  }
});

// === Socket.IO 接続 ===
io.on("connection", (socket) => {
  console.log("クライアント接続");

  socket.on("joinLink", (linkId) => {
    socket.join(linkId);
    console.log(`ルーム参加: ${linkId}`);
  });

  socket.on("disconnect", () => {
    console.log("クライアント切断");
  });
});

// === React の静的ファイル配信 ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
