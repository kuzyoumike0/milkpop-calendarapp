const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== Content Security Policy =====
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
  );
  next();
});

let schedulesDB = {};
let sessions = {}; // 簡易セッション

// ===== Discord OAuth2 =====
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.DISCORD_REDIRECT_URI ||
  "http://localhost:3000/api/auth/discord/callback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Discordログイン開始
app.get("/api/auth/discord", (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify`;
  res.redirect(url);
});

// Discordからのコールバック
app.get("/api/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code");

  try {
    // トークン取得
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

    // ユーザー情報取得
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    // セッションID発行
    const sessionId = uuidv4();
    sessions[sessionId] = user;

    // React側へセッションIDを渡す
    res.redirect(`${FRONTEND_URL}/auth-success?session=${sessionId}`);
  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).send("OAuth failed");
  }
});

// ユーザー情報取得API
app.get("/api/me/:sessionId", (req, res) => {
  const user = sessions[req.params.sessionId];
  if (!user) return res.status(401).json({ ok: false });
  res.json({ ok: true, user });
});

// ===== スケジュールAPI =====
app.post("/api/schedules", (req, res) => {
  const id = uuidv4();
  schedulesDB[id] = req.body; // 修正済み
  res.json({ ok: true, id });
});

app.get("/api/schedules/:id", (req, res) => {
  const { id } = req.params;
  const schedules = schedulesDB[id];
  if (!schedules) return res.status(404).json({ ok: false });
  res.json({ ok: true, schedules });
});

// ===== Reactビルド配信 =====
// Dockerfile で frontend/build を backend/build にコピーしている
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
