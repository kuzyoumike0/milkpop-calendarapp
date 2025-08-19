const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// === PostgreSQL接続設定 ===
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
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkId TEXT NOT NULL,
      username TEXT NOT NULL,
      date TEXT NOT NULL,
      timeslot TEXT NOT NULL,
      UNIQUE(linkId, username, date, timeslot)
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

// === 共有リンク発行 ===
app.post("/api/create-link", async (req, res) => {
  try {
    const linkId = uuidv4();
    await pool.query("INSERT INTO links (linkId) VALUES ($1)", [linkId]);
    res.json({ linkId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "リンク作成失敗" });
  }
});

// === スケジュール追加（UPSERT） ===
app.post("/api/schedules/:linkId", async (req, res) => {
  const { linkId } = req.params;
  const { username, dates, timeslot } = req.body;

  try {
    for (const date of dates) {
      await pool.query(
        `
        INSERT INTO schedules (linkId, username, date, timeslot)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (linkId, username, date, timeslot)
        DO UPDATE SET username = EXCLUDED.username
      `,
        [linkId, username, date, timeslot]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "保存失敗" });
  }
});

// === スケジュール削除（自分の登録のみ） ===
app.delete("/api/schedules/:linkId", async (req, res) => {
  const { linkId } = req.params;
  const { username, date, timeslot } = req.body;

  try {
    await pool.query(
      "DELETE FROM schedules WHERE linkId=$1 AND username=$2 AND date=$3 AND timeslot=$4",
      [linkId, username, date, timeslot]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "削除失敗" });
  }
});

// === スケジュール取得 ===
app.get("/api/schedules/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      "SELECT username, date, timeslot FROM schedules WHERE linkId=$1 ORDER BY date, timeslot",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// === Reactビルド配信 ===
app.use(express.static(path.join(__dirname, "./public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
