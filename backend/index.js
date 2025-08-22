// backend/index.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

const { v4: uuidv4 } = require("uuid");

const app = express();

// ===== 環境変数 =====
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const CALLBACK_URL =
  process.env.CALLBACK_URL || "http://localhost:3000/api/auth/discord/callback";
const SESSION_SECRET = process.env.SESSION_SECRET || "090612300623";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ DISCORD_CLIENT_ID または DISCORD_CLIENT_SECRET が設定されていません");
  process.exit(1);
}

// ===== ミドルウェア =====
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: SESSION_SECRET, // ← ここを環境変数から取得
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ===== Passport設定 =====
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new DiscordStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ["identify", "email"], // emailは任意
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// ===== 認証ルート =====
app.get(
  "/api/auth/discord",
  passport.authenticate("discord", { scope: ["identify", "email"] })
);

app.get(
  "/api/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/login-failed",
  }),
  (req, res) => {
    // 成功したらフロントにリダイレクト
    res.redirect("/dashboard");
  }
);

app.get("/api/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

app.get("/api/auth/user", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.json({ user: null });
  }
});

// ===== APIルート（例） =====
app.post("/api/schedules", (req, res) => {
  console.log("📥 受信:", req.body);
  res.json({ ok: true, id: uuidv4(), data: req.body });
});

// ===== Reactビルド配信 =====
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ===== 起動 =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
