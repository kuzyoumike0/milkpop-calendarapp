// backend/index.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== 簡易セッション管理 =====
let sessions = {}; // userId -> userInfo

// ===== Discord OAuth2 設定 =====
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.REDIRECT_URI ||
  "https://abundant-harmony-production.up.railway.app/api/auth/discord/callback";

// ===== Discord OAuth2 認証開始 =====
app.get("/api/auth/login", (req, res) => {
  const url = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify`;
  res.redirect(url);
});

// ===== 認証後のコールバック =====
app.get("/api/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Code missing");

  try {
    // 1. アクセストークン取得
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

    if (tokenData.error) {
      console.error("❌ Token error:", tokenData);
      return res.status(400).json({ ok: false, error: tokenData });
    }

    // 2. ユーザー情報取得
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    // セッションに保存（簡易版）
    sessions[user.id] = user;

    // フロントにリダイレクトして userId を渡す
    res.redirect(
      `/auth-success?userId=${user.id}&username=${encodeURIComponent(
        user.username
      )}`
    );
  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).send("OAuth failed");
  }
});

// ===== 現在のユーザー情報を返す =====
app.get("/api/auth/me/:id", (req, res) => {
  const user = sessions[req.params.id];
  if (!user) return res.json({ ok: false, error: "Not logged in" });
  res.json({ ok: true, user });
});

// ===== フロントのビルドを提供 =====
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// ===== サーバ起動 =====
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
