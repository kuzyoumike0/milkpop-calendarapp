const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// ===== DB接続 =====
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
        port: 5432,
      }
);

// ===== Express初期化 =====
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// ===== DB初期化 =====
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      linkid TEXT,
      date TEXT,
      title TEXT,
      timemode TEXT,
      starthour INT,
      endhour INT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      linkid TEXT,
      username TEXT,
      answer TEXT
    );
  `);
}
initDB();

// ===== 共有リンク作成 =====
app.post("/api/create-link", async (req, res) => {
  try {
    const { date, title, timemode, starthour, endhour } = req.body;
    const linkId = uuidv4();

    await pool.query(
      `INSERT INTO schedules (linkid, date, title, timemode, starthour, endhour)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [linkId, date, title, timemode, starthour, endhour]
    );

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成に失敗しました" });
  }
});

// ===== リンク情報取得 =====
app.get("/api/link/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const schedules = await pool.query(
      "SELECT * FROM schedules WHERE linkid=$1",
      [id]
    );
    const responses = await pool.query(
      "SELECT * FROM responses WHERE linkid=$1",
      [id]
    );

    res.json({
      schedules: schedules.rows,
      responses: responses.rows,
    });
  } catch (err) {
    console.error("リンク取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// ===== ○✕登録 =====
app.post("/api/respond", async (req, res) => {
  try {
    const { linkId, username, answer } = req.body;

    // 重複時は上書き
    await pool.query(
      `DELETE FROM responses WHERE linkid=$1 AND username=$2`,
      [linkId, username]
    );
    await pool.query(
      `INSERT INTO responses (linkid, username, answer) VALUES ($1,$2,$3)`,
      [linkId, username, answer]
    );

    // リアルタイム反映
    io.to(linkId).emit("update", { username, answer });

    res.json({ ok: true });
  } catch (err) {
    console.error("回答登録エラー:", err);
    res.status(500).json({ error: "登録に失敗しました" });
  }
});

// ===== Socket.IO =====
io.on("connection", (socket) => {
  console.log("クライアント接続:", socket.id);

  socket.on("join", (linkId) => {
    socket.join(linkId);
    console.log(`join room: ${linkId}`);
  });

  socket.on("disconnect", () => {
    console.log("切断:", socket.id);
  });
});

// ===== Reactビルド配信 =====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
