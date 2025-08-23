const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");
const fetch = require("node-fetch"); // 🔹Discord API 呼び出し用
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== DB 接続 =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ===== Discord OAuth =====
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

// ログイン開始
app.get("/auth/login", (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify`;
  res.redirect(url);
});

// コールバック
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  try {
    // アクセストークン取得
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Failed to get token" });
    }

    // ユーザー情報取得
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    // フロントにユーザー名を返す（本番は JWT/Cookie が安全）
    res.redirect(
      `/auth-success?username=${encodeURIComponent(userData.username)}`
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Auth error");
  }
});

// 認証成功用エンドポイント
app.get("/auth-success", (req, res) => {
  res.send(`
    <script>
      localStorage.setItem("username", "${req.query.username}");
      window.close(); // ポップアップを閉じる
    </script>
  `);
});

// ===== スケジュール登録API =====
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, timeRange, memo } = req.body;
    if (!title || !dates) {
      return res.status(400).json({ error: "title と dates は必須です" });
    }

    const result = await pool.query(
      "INSERT INTO schedules (title, dates, time_range, memo) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, dates, timeRange, memo]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// スケジュール取得
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// ===== 共有リンク生成 =====
app.post("/api/share", async (req, res) => {
  try {
    const { scheduleIds } = req.body;
    if (!scheduleIds || scheduleIds.length === 0) {
      return res.status(400).json({ error: "scheduleIds が必要です" });
    }

    // ランダムなURLキーを生成
    const linkKey = crypto.randomBytes(6).toString("hex");

    // DB保存
    await pool.query(
      "INSERT INTO share_links (link_key, schedule_ids) VALUES ($1, $2)",
      [linkKey, scheduleIds]
    );

    res.json({ url: `/share/${linkKey}` });
  } catch (err) {
    console.error("共有エラー:", err);
    res.status(500).json({ error: "共有に失敗しました" });
  }
});

// 共有リンクからスケジュール取得
app.get("/share/:linkKey", async (req, res) => {
  try {
    const { linkKey } = req.params;
    const result = await pool.query(
      "SELECT schedule_ids FROM share_links WHERE link_key=$1",
      [linkKey]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }

    const scheduleIds = result.rows[0].schedule_ids;
    const schedules = await pool.query(
      "SELECT * FROM schedules WHERE id = ANY($1::int[])",
      [scheduleIds]
    );

    res.json(schedules.rows);
  } catch (err) {
    console.error("共有取得エラー:", err);
    res.status(500).json({ error: "共有データ取得に失敗しました" });
  }
});

// ===== React ビルド配信 =====
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ MilkPOP Calendar running on port ${PORT}`);
});
