const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");
const fetch = require("node-fetch"); // 🔹追加
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

    // フロントにユーザー名を返す（本番ではJWT/Cookieにするのが安全）
    res.redirect(`/auth-success?username=${encodeURIComponent(userData.username)}`);
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
