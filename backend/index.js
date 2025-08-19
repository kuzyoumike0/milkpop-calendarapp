const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// === Middleware ===
app.use(cors());
app.use(bodyParser.json());

// === PostgreSQL接続設定 ===
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
    CREATE TABLE IF NOT EXISTS share_links (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      link_id TEXT REFERENCES share_links(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      comment TEXT,
      token TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB().catch((err) => console.error("DB init error:", err));

/* ============================
   API エンドポイント
============================ */

// 1. 共有リンク作成
app.post("/api/share", async (req, res) => {
  try {
    const linkId = uuidv4();
    await pool.query("INSERT INTO share_links (id) VALUES ($1)", [linkId]);
    res.json({ linkId });
  } catch (err) {
    console.error("Error creating share link:", err);
    res.status(500).json({ error: "共有リンク作成失敗" });
  }
});

// 2. 予定登録（共有リンク付き）
app.post("/api/share/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const { username, date, timeslot, comment } = req.body;

    // トークン発行
    const scheduleId = uuidv4();
    const token = uuidv4();

    await pool.query(
      `INSERT INTO schedules (id, link_id, username, date, timeslot, comment, token)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [scheduleId, linkId, username, date, timeslot, comment || "", token]
    );

    res.json({ id: scheduleId, token });
  } catch (err) {
    console.error("Error inserting schedule:", err);
    res.status(500).json({ error: "予定登録失敗" });
  }
});

// 3. 共有リンクから予定一覧取得
app.get("/api/shared/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      "SELECT id, username, date, timeslot, comment FROM schedules WHERE link_id = $1 ORDER BY date ASC",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "予定取得失敗" });
  }
});

// 4. 予定更新
app.put("/api/schedule/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, date, timeslot, comment, token } = req.body;

    const result = await pool.query("SELECT token FROM schedules WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "予定が存在しません" });

    if (result.rows[0].token !== token) {
      return res.status(403).json({ error: "キーが一致しません" });
    }

    await pool.query(
      `UPDATE schedules SET username=$1, date=$2, timeslot=$3, comment=$4 WHERE id=$5`,
      [username, date, timeslot, comment, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating schedule:", err);
    res.status(500).json({ error: "更新失敗" });
  }
});

// 5. 予定削除
app.delete("/api/schedule/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const result = await pool.query("SELECT token FROM schedules WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "予定が存在しません" });

    if (result.rows[0].token !== token) {
      return res.status(403).json({ error: "キーが一致しません" });
    }

    await pool.query("DELETE FROM schedules WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting schedule:", err);
    res.status(500).json({ error: "削除失敗" });
  }
});

// === 静的ファイル (React ビルド) ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバ起動 ===
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
