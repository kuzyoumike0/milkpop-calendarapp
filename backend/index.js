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

app.use(cors());
app.use(bodyParser.json());

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
    CREATE TABLE IF NOT EXISTS links (
      linkId TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      timeSlot TEXT NOT NULL,
      mode TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkId TEXT REFERENCES links(linkId) ON DELETE CASCADE,
      date DATE NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      linkId TEXT REFERENCES links(linkId) ON DELETE CASCADE,
      username TEXT NOT NULL,
      date DATE NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB().catch((err) => console.error("DB初期化失敗:", err));

// === API ===

// 共有リンク発行
app.post("/api/createLink", async (req, res) => {
  try {
    const { title, dates, timeSlot, mode } = req.body;
    const linkId = uuidv4();

    await pool.query(
      "INSERT INTO links (linkId, title, timeSlot, mode) VALUES ($1, $2, $3, $4)",
      [linkId, title, timeSlot, mode]
    );

    for (const d of dates) {
      await pool.query("INSERT INTO schedules (linkId, date) VALUES ($1, $2)", [
        linkId,
        d,
      ]);
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成失敗:", err);
    res.status(500).send("リンク作成に失敗しました");
  }
});

// 共有リンク内容取得
app.get("/api/schedules/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    const linkResult = await pool.query("SELECT * FROM links WHERE linkId = $1", [
      linkId,
    ]);
    if (linkResult.rowCount === 0) return res.status(404).send("リンクが存在しません");

    const scheduleResult = await pool.query(
      "SELECT date FROM schedules WHERE linkId = $1 ORDER BY date ASC",
      [linkId]
    );

    const responseResult = await pool.query(
      "SELECT username, date, status FROM responses WHERE linkId = $1",
      [linkId]
    );

    // 整形: { "2025-08-21": { "Alice": "◯", "Bob": "✕" }, ... }
    const responses = {};
    responseResult.rows.forEach((r) => {
      const d = r.date.toISOString().split("T")[0];
      if (!responses[d]) responses[d] = {};
      responses[d][r.username] = r.status;
    });

    res.json({
      title: linkResult.rows[0].title,
      timeSlot: linkResult.rows[0].timeslot,
      mode: linkResult.rows[0].mode,
      dates: scheduleResult.rows.map((r) => r.date.toISOString().split("T")[0]),
      responses,
    });
  } catch (err) {
    console.error("取得失敗:", err);
    res.status(500).send("取得に失敗しました");
  }
});

// 出欠回答保存
app.post("/api/response", async (req, res) => {
  try {
    const { linkId, username, date, status } = req.body;

    // すでに同じ人が同じ日付に回答していたら更新
    const existing = await pool.query(
      "SELECT * FROM responses WHERE linkId = $1 AND username = $2 AND date = $3",
      [linkId, username, date]
    );

    if (existing.rowCount > 0) {
      await pool.query(
        "UPDATE responses SET status = $1 WHERE linkId = $2 AND username = $3 AND date = $4",
        [status, linkId, username, date]
      );
    } else {
      await pool.query(
        "INSERT INTO responses (linkId, username, date, status) VALUES ($1, $2, $3, $4)",
        [linkId, username, date, status]
      );
    }

    // 全体更新を通知
    const allResponses = await pool.query(
      "SELECT username, date, status FROM responses WHERE linkId = $1",
      [linkId]
    );
    const responses = {};
    allResponses.rows.forEach((r) => {
      const d = r.date.toISOString().split("T")[0];
      if (!responses[d]) responses[d] = {};
      responses[d][r.username] = r.status;
    });

    io.to(linkId).emit("updateResponses", responses);

    res.json({ success: true });
  } catch (err) {
    console.error("保存失敗:", err);
    res.status(500).send("保存に失敗しました");
  }
});

// === ソケット ===
io.on("connection", (socket) => {
  socket.on("join", (linkId) => {
    socket.join(linkId);
  });
});

// === 静的ファイル配信（本番用） ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
