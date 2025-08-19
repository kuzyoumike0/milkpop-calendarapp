const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// === PostgreSQL 接続設定 ===
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
        database: process.env.DB_NAME || "calendar",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB初期化（init.sql を実行） ===
async function initDB() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, "init.sql")).toString();
    await pool.query(sql);
    console.log("✅ Database initialized with init.sql");
  } catch (err) {
    console.error("❌ Failed to initialize database:", err);
  }
}
initDB();

// === API ===

// 共有リンク作成
app.post("/api/create-link", async (req, res) => {
  try {
    const { title, schedules } = req.body;
    const linkId = uuidv4();

    await pool.query("INSERT INTO links (id, title) VALUES ($1, $2)", [
      linkId,
      title,
    ]);

    for (const s of schedules) {
      await pool.query(
        "INSERT INTO schedules (link_id, date, timeslot) VALUES ($1, $2, $3)",
        [linkId, s.date, s.timeslot]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("Error creating link:", err);
    res.status(500).json({ error: "Failed to create link" });
  }
});

// リンクから候補一覧取得
app.get("/api/link/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const linkRes = await pool.query("SELECT * FROM links WHERE id=$1", [
      linkId,
    ]);
    const schedulesRes = await pool.query(
      "SELECT * FROM schedules WHERE link_id=$1 ORDER BY date, timeslot",
      [linkId]
    );
    const responsesRes = await pool.query(
      "SELECT * FROM responses WHERE link_id=$1",
      [linkId]
    );

    res.json({
      link: linkRes.rows[0],
      schedules: schedulesRes.rows,
      responses: responsesRes.rows,
    });
  } catch (err) {
    console.error("Error fetching link:", err);
    res.status(500).json({ error: "Failed to fetch link" });
  }
});

// 回答登録（◯ ×）
app.post("/api/respond", async (req, res) => {
  try {
    const { linkId, date, timeslot, username, choice } = req.body;
    await pool.query(
      `INSERT INTO responses (link_id, date, timeslot, username, choice)
       VALUES ($1, $2, $3, $4, $5)`,
      [linkId, date, timeslot, username, choice]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving response:", err);
    res.status(500).json({ error: "Failed to save response" });
  }
});

// フロントエンドを返す
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
