// backend/index.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== 簡易DB =====
// schedulesDB = { shareId: { title, memo, dates, options, ownerId, responses } }
let schedulesDB = {};
// sessions = { userId -> userInfo }
let sessions = {};

// ===== Discord OAuth2 設定 =====
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI =
  process.env.REDIRECT_URI || "http://localhost:8080/api/auth/callback";

// Discord OAuth2 認証開始
app.get("/api/auth/login", (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify`;
  res.redirect(url);
});

// 認証後のコールバック
app.get("/api/auth/callback", async (req, res) => {
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

    if (!tokenData.access_token) {
      console.error("Token error:", tokenData);
      return res.status(400).send("Failed to get access token");
    }

    // 2. ユーザー情報取得
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    if (!user || !user.id) {
      console.error("User fetch error:", user);
      return res.status(400).send("Failed to fetch user");
    }

    // セッションに保存
    sessions[user.id] = user;

    // フロントにリダイレクト
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

// ===== スケジュール登録 =====
app.post("/api/register", (req, res) => {
  const { userId, title, memo, dates, options } = req.body;

  if (!userId || !sessions[userId]) {
    return res.json({ ok: false, error: "ログインが必要です" });
  }
  if (!title || !dates || dates.length === 0) {
    return res.json({ ok: false, error: "必須項目が不足しています" });
  }

  const shareId = uuidv4();
  schedulesDB[shareId] = {
    ownerId: userId,
    title,
    memo,
    dates,
    options,
    responses: {}, // { userId: { ...responses } }
  };

  res.json({ ok: true, shareId });
});

// ===== スケジュール取得 =====
app.get("/api/schedules/:id", (req, res) => {
  const { id } = req.params;
  const schedule = schedulesDB[id];
  if (!schedule) {
    return res.json({ ok: false, error: "スケジュールが存在しません" });
  }
  res.json({ ok: true, data: schedule });
});

// ===== 出欠保存 =====
app.post("/api/share/:id/respond", (req, res) => {
  const { id } = req.params;
  const { userId, responses } = req.body;

  if (!userId || !sessions[userId]) {
    return res.json({ ok: false, error: "ログインが必要です" });
  }
  if (!schedulesDB[id]) {
    return res.json({ ok: false, error: "スケジュールが存在しません" });
  }

  const safeResponses =
    responses && typeof responses === "object" ? responses : {};

  schedulesDB[id].responses[userId] = safeResponses;

  res.json({ ok: true, data: schedulesDB[id] });
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
