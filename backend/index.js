const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Railway の環境変数を使って接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ====== DB 初期化 ======
const initAllDB = async () => {
  try {
    // 古い「日付」カラムが残っているテーブルを消す（開発用）
    await pool.query(`DROP TABLE IF EXISTS schedules CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS personal_schedules CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS votes CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS share_links CASCADE`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        title TEXT,
        date DATE NOT NULL,
        selection_mode TEXT,
        time_type TEXT,
        start_time TEXT,
        end_time TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS personal_schedules (
        id SERIAL PRIMARY KEY,
        title TEXT,
        memo TEXT,
        date DATE NOT NULL,
        selection_mode TEXT,
        time_type TEXT,
        start_time TEXT,
        end_time TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        schedule_id INT NOT NULL,
        username TEXT,
        choice TEXT CHECK (choice IN ('〇','△','✖')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS share_links (
        id SERIAL PRIMARY KEY,
        url TEXT UNIQUE NOT NULL,
        title TEXT,
        schedule_ids INT[],
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Tables initialized");
  } catch (err) {
    console.error("❌ DB initialization error:", err);
  }
};
initAllDB();

// ====== API ======

// 確認用ルート
app.get("/api", (req, res) => {
  res.json({ success: true, message: "✅ MilkPOP Calendar API 稼働中" });
});

// ===== スケジュール保存 =====
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, date, selectionMode, timeType, startTime, endTime } = req.body;
    const normalizedDate = new Date(date);

    const result = await pool.query(
      `INSERT INTO schedules (title, date, selection_mode, time_type, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, normalizedDate, selectionMode, timeType, startTime, endTime]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "DB insert error" });
  }
});

// ===== スケジュール一覧 =====
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM schedules ORDER BY date ASC`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "DB fetch error" });
  }
});

// ===== 個人スケジュール保存 =====
app.post("/api/personal-schedules", async (req, res) => {
  try {
    const { title, memo, date, selectionMode, timeType, startTime, endTime } = req.body;
    const normalizedDate = new Date(date);

    const result = await pool.query(
      `INSERT INTO personal_schedules (title, memo, date, selection_mode, time_type, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, memo, normalizedDate, selectionMode, timeType, startTime, endTime]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "DB insert error" });
  }
});

// ===== 個人スケジュール一覧 =====
app.get("/api/personal-schedules", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM personal_schedules ORDER BY date ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "DB fetch error" });
  }
});

// ===== 投票保存 =====
app.post("/api/votes", async (req, res) => {
  try {
    const { scheduleId, username, choice } = req.body;
    const result = await pool.query(
      `INSERT INTO votes (schedule_id, username, choice)
       VALUES ($1, $2, $3) RETURNING *`,
      [scheduleId, username, choice]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "DB insert error" });
  }
});

// ===== 投票取得 =====
app.get("/api/votes/:scheduleId", async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const result = await pool.query(
      `SELECT username, choice FROM votes WHERE schedule_id = $1`,
      [scheduleId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "DB fetch error" });
  }
});

// ===== 共有リンク作成 =====
app.post("/api/share-links", async (req, res) => {
  try {
    const { title, scheduleIds } = req.body;
    const randomUrl = crypto.randomBytes(6).toString("hex");

    const result = await pool.query(
      `INSERT INTO share_links (url, title, schedule_ids)
       VALUES ($1, $2, $3) RETURNING *`,
      [randomUrl, title, scheduleIds || []]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "DB insert error" });
  }
});

// ===== 共有リンク一覧 =====
app.get("/api/share-links", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM share_links ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "DB fetch error" });
  }
});

// ===== 個別リンク取得 =====
app.get("/api/share-links/:url", async (req, res) => {
  try {
    const { url } = req.params;
    const result = await pool.query(`SELECT * FROM share_links WHERE url = $1`, [url]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Not Found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "DB fetch error" });
  }
});

// ===== 共有リンクのスケジュール取得 =====
app.get("/api/share-links/:url/schedules", async (req, res) => {
  try {
    const { url } = req.params;
    const linkResult = await pool.query(
      `SELECT * FROM share_links WHERE url = $1`,
      [url]
    );
    if (linkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Link not found" });
    }

    const link = linkResult.rows[0];
    if (!link.schedule_ids || link.schedule_ids.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const schedules = await pool.query(
      `SELECT * FROM schedules WHERE id = ANY($1) ORDER BY date ASC`,
      [link.schedule_ids]
    );

    res.json({ success: true, data: schedules.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "DB fetch error" });
  }
});

// ====== React ビルドを配信 ======
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ====== サーバー起動 ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ MilkPOP Calendar running on port ${PORT}`);
});
