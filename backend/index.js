// backend/index.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
import { v4 as uuidv4 } from "uuid";
import Holidays from "date-holidays";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 5000;

// ====== Utility for __dirname in ES modules ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());

// PostgreSQL 接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// 初期テーブル作成
(async () => {
  const client = await pool.connect();
  try {
    // スケジュール
    await client.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        dates DATE[] NOT NULL,
        time_range TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 共有リンク
    await client.query(`
      CREATE TABLE IF NOT EXISTS share_links (
        id SERIAL PRIMARY KEY,
        url TEXT UNIQUE NOT NULL,
        schedule_ids INT[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 投票テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        share_url TEXT NOT NULL,
        username TEXT NOT NULL,
        votes JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(share_url, username) -- 同じ人は上書き
      );
    `);
  } finally {
    client.release();
  }
})();

// ====================== API ======================

// 祝日取得API（JP）
app.get("/api/holidays/:year", (req, res) => {
  const year = parseInt(req.params.year, 10);
  const hd = new Holidays("JP");
  const holidays = hd.getHolidays(year).map((h) => ({
    date: h.date,
    name: h.name,
  }));
  res.json(holidays);
});

// 日程登録
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, timeRange } = req.body;
    if (!title || !dates || !timeRange) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    const result = await pool.query(
      "INSERT INTO schedules (title, dates, time_range) VALUES ($1, $2, $3) RETURNING id",
      [title, dates, timeRange]
    );

    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Error inserting schedule:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// 共有リンク作成
app.post("/api/share", async (req, res) => {
  try {
    const { scheduleIds } = req.body;
    if (!scheduleIds || scheduleIds.length === 0) {
      return res.status(400).json({ error: "スケジュールが指定されていません" });
    }

    const url = `/share/${uuidv4()}`;
    await pool.query(
      "INSERT INTO share_links (url, schedule_ids) VALUES ($1, $2)",
      [url, scheduleIds]
    );

    res.json({ success: true, url });
  } catch (err) {
    console.error("Error creating share link:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// 共有リンクからスケジュール取得
app.get("/api/share/:uuid", async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const url = `/share/${uuid}`;

    const result = await pool.query("SELECT * FROM share_links WHERE url=$1", [url]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }

    const scheduleIds = result.rows[0].schedule_ids;
    const schedules = await pool.query(
      "SELECT * FROM schedules WHERE id = ANY($1::int[])",
      [scheduleIds]
    );

    res.json({ schedules: schedules.rows });
  } catch (err) {
    console.error("Error fetching shared schedules:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// ====================== 投票機能 ======================

// 投票保存 (◯✖△)
app.post("/api/share/:uuid/vote", async (req, res) => {
  try {
    const { uuid } = req.params;
    const { username, votes } = req.body;
    const share_url = `/share/${uuid}`;

    if (!username || !votes) {
      return res.status(400).json({ error: "名前と投票が必要です" });
    }

    await pool.query(
      `INSERT INTO votes (share_url, username, votes)
       VALUES ($1, $2, $3)
       ON CONFLICT (share_url, username)
       DO UPDATE SET votes = $3, created_at = NOW()`,
      [share_url, username, JSON.stringify(votes)]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ 投票保存エラー:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// 投票取得
app.get("/api/share/:uuid/votes", async (req, res) => {
  try {
    const { uuid } = req.params;
    const share_url = `/share/${uuid}`;

    const result = await pool.query(
      "SELECT username, votes FROM votes WHERE share_url = $1",
      [share_url]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ 投票取得エラー:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// ====================== Discord OAuth2 ======================

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI =
  process.env.DISCORD_REDIRECT_URI || "http://localhost:5000/callback";

// Discordログイン開始
app.get("/auth/discord", (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    DISCORD_REDIRECT_URI
  )}&response_type=code&scope=identify`;
  res.redirect(url);
});

// Discord OAuth2 コールバック
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided");

  try {
    // アクセストークン取得
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
        scope: "identify",
      }),
    });
    const tokenData = await tokenRes.json();

    // ユーザー情報取得
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    // ✅ discriminatorは使わず username のみ渡す
    res.redirect(`/share-login?username=${encodeURIComponent(userData.username)}`);
  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).send("OAuth failed");
  }
});

// ====================== 静的ファイル配信 ======================
app.use(express.static(path.join(__dirname, "public")));

// React ルーティング対応 (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ====================== サーバー起動 ======================
app.listen(port, () => {
  console.log(`✅ Backend running on http://localhost:${port}`);
});
