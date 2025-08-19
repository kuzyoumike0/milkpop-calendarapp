const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// === DB接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

app.use(cors());
app.use(bodyParser.json());

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkId TEXT NOT NULL,
      title TEXT,
      date TEXT NOT NULL,
      timeSlot TEXT NOT NULL,
      username TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);
}
initDB();

// === API ===
app.post("/api/create-link", async (req, res) => {
  const { title } = req.body;
  const linkId = uuidv4();
  try {
    await pool.query(
      "INSERT INTO schedules (linkId, title, date, timeSlot, username, status) VALUES ($1,$2,$3,$4,$5,$6)",
      [linkId, title || "", "", "", "", ""]
    );
    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成失敗:", err);
    res.status(500).json({ error: "リンク作成失敗" });
  }
});

app.get("/api/schedules/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM schedules WHERE linkId=$1 ORDER BY date, timeSlot",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("取得失敗:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

app.post("/api/schedule", async (req, res) => {
  const { linkId, date, timeSlot, username, status } = req.body;
  try {
    await pool.query(
      "INSERT INTO schedules (linkId, date, timeSlot, username, status) VALUES ($1,$2,$3,$4,$5)",
      [linkId, date, timeSlot, username, status]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("保存失敗:", err);
    res.status(500).json({ error: "保存失敗" });
  }
});

// === Reactビルド配信 ===
const buildPath = path.join(__dirname, "public");
if (fs.existsSync(path.join(buildPath, "index.html"))) {
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  console.error("⚠️ Reactビルドが存在しません。public/index.html が必要です。");
  app.get("*", (req, res) => {
    res.send("<h1>Frontend not built yet</h1>");
  });
}

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
