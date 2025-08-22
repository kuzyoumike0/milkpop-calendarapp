// backend/index.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "milkpop-secret", // 環境変数にするのが望ましい
    resave: false,
    saveUninitialized: false,
  })
);

// ===== 簡易DB（本番はPostgresなどにする） =====
let schedulesDB = {}; // 共有リンク用
let userSchedulesDB = {}; // Discordユーザーごとの個人スケジュール

// ===== Discord OAuth2 設定 =====
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

// Discord OAuth2 コールバック
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    req.session.user = userRes.data; // { id, username, avatar }
    console.log("✅ ログイン:", userRes.data.username);
    res.redirect("/personal"); // React 側の個人ページへ
  } catch (err) {
    console.error("❌ Discord認証エラー:", err.response?.data || err.message);
    res.status(500).send("認証エラー");
  }
});

// ログインユーザー情報取得
app.get("/api/me", (req, res) => {
  if (!req.session.user) return res.json({ ok: false });
  res.json({ ok: true, user: req.session.user });
});

// ===== 共有リンク用 =====

// 登録
app.post("/api/schedules", (req, res) => {
  const id = uuidv4();
  schedulesDB[id] = req.body.schedules;
  console.log("📥 保存 (共有):", schedulesDB[id]);
  res.json({ ok: true, id });
});

// 取得
app.get("/api/schedules/:id", (req, res) => {
  const { id } = req.params;
  const schedules = schedulesDB[id];
  if (!schedules) {
    return res.status(404).json({ ok: false, message: "Not found" });
  }
  res.json({ ok: true, schedules });
});

// ===== 個人スケジュール用 =====

// 保存
app.post("/api/myschedule", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ ok: false, message: "ログインしてください" });
  }
  userSchedulesDB[req.session.user.id] = req.body;
  console.log("📥 保存 (個人):", req.session.user.username, req.body);
  res.json({ ok: true });
});

// 取得
app.get("/api/myschedule", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ ok: false, message: "ログインしてください" });
  }
  const schedule = userSchedulesDB[req.session.user.id] || null;
  res.json({ ok: true, schedule });
});

// ===== Reactビルド配信 =====
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
