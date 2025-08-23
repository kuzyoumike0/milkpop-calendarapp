const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");
const fetch = require("node-fetch");
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
      window.close();
    </script>
  `);
});

// ===== API: スケジュール登録 =====
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, options } = req.body;
    console.log("受信データ:", req.body);

    if (!title || !dates) {
      return res.status(400).json({ error: "title と dates は必須です" });
    }

    const id = crypto.randomUUID();
    const shareToken = crypto.randomBytes(6).toString("hex");

    const result = await pool.query(
      `INSERT INTO schedules (id, title, dates, options, share_token)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)
       RETURNING *`,
      [
        id,
        title,
        JSON.stringify(dates || []),
        JSON.stringify(options || {}),
        shareToken,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// ===== API: スケジュール取得 =====
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM schedules ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// ===== API: 共有リンク生成 =====
app.post("/api/share", async (req, res) => {
  try {
    const { scheduleId } = req.body;
    if (!scheduleId) {
      return res.status(400).json({ error: "scheduleId が必要です" });
    }

    const shareToken = crypto.randomBytes(6).toString("hex");

    await pool.query(
      "UPDATE schedules SET share_token=$1 WHERE id=$2",
      [shareToken, scheduleId]
    );

    res.json({ url: `/share/${shareToken}` });
  } catch (err) {
    console.error("共有エラー:", err);
    res.status(500).json({ error: "共有に失敗しました" });
  }
});

// ===== API: 共有リンクからスケジュール取得 =====
app.get("/share/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const result = await pool.query(
      "SELECT * FROM schedules WHERE share_token=$1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "リンクが存在しません" });
    }

    res.json(result.rows[0]);
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
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ MilkPOPカレンダーはポート${PORT}で動作しています`);
});
